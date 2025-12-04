import * as grpc from '@grpc/grpc-js';
import { createSupabaseClient, createLogger } from '@pset4/shared-types';

const logger = createLogger('grade-handler');

/**
 * Handles GetGrades requests - students view their grades across all enrolled sections.
 */
export async function handleGetGrades(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  const { student_id } = call.request;

  logger.info('GetGrades request received', { student_id });

  try {
    const supabase = createSupabaseClient();

    // Fetch grades + related section + course info
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

    const typedGrades = data as any[] | null;

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
    logger.error('Unexpected error in GetGrades', error.message);
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

  try {
    const supabase = createSupabaseClient();

    // Verify that section exists AND belongs to this faculty
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('id, faculty_id')
      .eq('id', section_id)
      .single();

    if (sectionError || !section) {
      logger.error('Section not found', { sectionError });
      return callback(null, {
        success: false,
        message: 'Section does not exist',
      });
    }

    if (section.faculty_id !== faculty_id) {
      logger.warn('Unauthorized grade upload attempt', {
        faculty_id,
        sectionOwner: section.faculty_id
      });
      return callback(null, {
        success: false,
        message: 'You are not authorized to upload grades for this section',
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
      }, { onConflict: 'student_id, section_id' });

    if (upsertError) {
      logger.error('Failed to upload grade', { upsertError });
      return callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to upload grade',
      });
    }

    logger.info('Grade successfully uploaded');

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

  try {
    const supabase = createSupabaseClient();

    // Verify section exists and belongs to faculty
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('id, faculty_id, course_id')
      .eq('id', section_id)
      .single();

    if (sectionError || !section) {
      logger.error('Section not found', { sectionError });
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Section does not exist',
      });
    }

    if (section.faculty_id !== faculty_id) {
      logger.warn('Unauthorized section grade access', {
        faculty_id,
        sectionOwner: section.faculty_id
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

    const typedGrades = data as any[] | null;

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

