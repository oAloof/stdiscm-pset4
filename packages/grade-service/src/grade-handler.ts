import * as grpc from '@grpc/grpc-js';
import { createSupabaseClient, createLogger } from '@pset4/shared-types';

const logger = createLogger('grade-handler');

// --- Interfaces for Query Results ---

interface GradeWithDetails {
  id: string;
  student_id: string;
  section_id: string;
  grade_value: number;
  uploaded_at: string;
  sections: {
    section_code: string;
    courses: {
      code: string;
      name: string;
    } | null;
  } | null;
  users: {
    name: string;
  } | null;
}

interface SectionInfo {
  id: string;
  faculty_id: string;
  course_id?: string;
}



/**
 * Handles GetGrades requests - students view their grades across all enrolled sections.
 */
export async function handleGetGrades(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  const { student_id } = call.request;

  logger.info('GetGrades request received', { student_id });

  if (!student_id) {
    logger.warn('GetGrades failed: Missing student_id');
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'student_id is required',
    });
  }

  try {
    const supabase = createSupabaseClient();

    // Fetch grades with section, course, and user details
    const { data, error } = await supabase
      .from('grades')
      .select(`
        id,
        student_id,
        section_id,
        grade_value,
        uploaded_at,
        sections!inner (
          section_code,
          courses!inner (
            code,
            name
          )
        ),
        users!inner (
          name
        )
      `)
      .eq('student_id', student_id);

    if (error) {
      logger.error('Supabase error during GetGrades', { error: error.message });
      return callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to fetch grades',
      });
    }

    const typedGrades = data as GradeWithDetails[] | null;

    logger.info('Grades fetched successfully', { count: typedGrades?.length || 0 });

    const responseGrades =
      typedGrades?.map(g => ({
        id: g.id,
        student_id: g.student_id,
        student_name: g.users?.name || "",
        section_id: g.section_id,
        course_code: g.sections?.courses?.code || "",
        course_name: g.sections?.courses?.name || "",
        grade_value: g.grade_value,
        uploaded_at: g.uploaded_at,
      })) || [];

    callback(null, { grades: responseGrades });
  } catch (error: any) {
    logger.error('Unexpected error in GetGrades', { error: error.message });
    return callback({
      code: grpc.status.INTERNAL,
      message: 'An error occurred while fetching grades',
    });
  }
}

/**
 * Handles UploadGrade requests - faculty upload grades for students in their sections.
 */
export async function handleUploadGrade(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  const { student_id, section_id, grade_value, faculty_id } = call.request;

  logger.info('UploadGrade request received', {
    student_id,
    section_id,
    grade_value,
    faculty_id
  });

  // Validate required parameters
  if (!student_id || !section_id || grade_value === undefined || !faculty_id) {
    logger.warn('UploadGrade failed: Missing required parameters');
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'student_id, section_id, grade_value, and faculty_id are required',
    });
  }

  // Validate grade value range (0.0 to 4.0) and increment (0.5)
  if (grade_value < 0 || grade_value > 4.0) {
    logger.warn('UploadGrade failed: Invalid grade value range', { grade_value });
    return callback(null, {
      success: false,
      message: 'Grade value must be between 0.0 and 4.0',
    });
  }

  // Check for 0.5 increments
  if ((grade_value * 10) % 5 !== 0) {
    logger.warn('UploadGrade failed: Invalid grade increment', { grade_value });
    return callback(null, {
      success: false,
      message: 'Grade value must be in increments of 0.5 (e.g., 3.0, 3.5, 4.0)',
    });
  }

  try {
    const supabase = createSupabaseClient();

    // Verify section exists and belongs to faculty
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('id, faculty_id')
      .eq('id', section_id)
      .single();

    const typedSection = section as SectionInfo | null;

    if (sectionError || !typedSection) {
      logger.error('Section not found', { error: sectionError?.message });
      return callback(null, {
        success: false,
        message: 'Section does not exist',
      });
    }

    if (typedSection.faculty_id !== faculty_id) {
      logger.warn('Unauthorized grade upload attempt', {
        faculty_id,
        sectionOwner: typedSection.faculty_id
      });
      return callback(null, {
        success: false,
        message: 'You are not authorized to upload grades for this section',
      });
    }

    // Verify student is enrolled in this section
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', student_id)
      .eq('section_id', section_id)
      .single();

    if (enrollmentError || !enrollment) {
      logger.warn('Student not enrolled in section', {
        student_id,
        section_id
      });
      return callback(null, {
        success: false,
        message: 'Student is not enrolled in this section',
      });
    }

    // UPSERT grade (update if exists, insert if new)
    const { error: upsertError } = await supabase
      .from('grades')
      .upsert({
        student_id,
        section_id,
        grade_value,
        uploaded_at: new Date().toISOString(),
      } as any, { onConflict: 'student_id, section_id' });

    if (upsertError) {
      logger.error('Failed to upload grade', { error: upsertError.message });
      return callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to upload grade',
      });
    }

    logger.info('Grade successfully uploaded', { student_id, section_id, grade_value });

    callback(null, {
      success: true,
      message: 'Grade uploaded successfully',
    });
  } catch (error: any) {
    logger.error('Unexpected error in UploadGrade', { error: error.message });
    callback({
      code: grpc.status.INTERNAL,
      message: 'An error occurred while uploading grade',
    });
  }
}
/**
 * Handles GetSectionGrades requests - faculty view all grades for a specific section.
 */
export async function handleGetSectionGrades(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  const { section_id, faculty_id } = call.request;

  logger.info('GetSectionGrades request received', { section_id, faculty_id });

  if (!section_id || !faculty_id) {
    logger.warn('GetSectionGrades failed: Missing required parameters');
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'section_id and faculty_id are required',
    });
  }

  try {
    const supabase = createSupabaseClient();

    // Verify section exists and belongs to faculty
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('id, faculty_id, course_id')
      .eq('id', section_id)
      .single();

    const typedSection = section as SectionInfo | null;

    if (sectionError || !typedSection) {
      logger.error('Section not found', { error: sectionError?.message });
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Section does not exist',
      });
    }

    if (typedSection.faculty_id !== faculty_id) {
      logger.warn('Unauthorized section grade access', {
        faculty_id,
        sectionOwner: typedSection.faculty_id
      });
      return callback({
        code: grpc.status.PERMISSION_DENIED,
        message: 'You are not authorized to view grades for this section',
      });
    }

    // Fetch grades with relevant joins
    const { data, error } = await supabase
      .from('grades')
      .select(`
        id,
        student_id,
        section_id,
        grade_value,
        uploaded_at,
        users!inner ( name ),
        sections!inner (
          section_code,
          courses!inner (
            code,
            name
          )
        )
      `)
      .eq('section_id', section_id);

    if (error) {
      logger.error('Database error during GetSectionGrades', { error: error.message });
      return callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to fetch section grades',
      });
    }

    const typedGrades = data as GradeWithDetails[] | null;

    logger.info('Section grades fetched', { count: typedGrades?.length || 0 });

    const responseGrades =
      typedGrades?.map(g => ({
        id: g.id,
        student_id: g.student_id,
        student_name: g.users?.name || "",
        section_id: g.section_id,
        course_code: g.sections?.courses?.code || "",
        course_name: g.sections?.courses?.name || "",
        grade_value: g.grade_value,
        uploaded_at: g.uploaded_at,
      })) || [];

    callback(null, { grades: responseGrades });
  } catch (error: any) {
    logger.error('Unexpected error in GetSectionGrades', { error: error.message });
    callback({
      code: grpc.status.INTERNAL,
      message: 'An error occurred while fetching section grades',
    });
  }
}

