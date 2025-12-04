import * as grpc from '@grpc/grpc-js';
import { createSupabaseClient, createLogger, Course } from '@pset4/shared-types';

const logger = createLogger('course-handler');

// --- Interfaces for Query Results ---

interface SectionWithDetails {
  id: string;
  course_id: string;
  section_code: string;
  faculty_id: string;
  faculty: { name: string } | null;
  max_capacity: number;
  enrolled_count: number;
}

interface EnrollmentWithDetails {
  id: string;
  student_id: string;
  section_id: string;
  enrolled_at: string;
  section: {
    section_code: string;
    course: {
      id: string;
      code: string;
      name: string;
    } | null;
    faculty: {
      name: string;
    } | null;
  } | null;
}

interface FacultySectionWithCourse {
  id: string;
  course_id: string;
  section_code: string;
  max_capacity: number;
  enrolled_count: number;
  course: {
    code: string;
    name: string;
  } | null;
}

/**
 * Handles ListCourses requests by fetching all courses from database.
 * Supports optional pagination via limit and offset.
 */
export async function handleListCourses(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  const { limit, offset } = call.request;

  logger.info('ListCourses request received', { limit, offset });

  try {
    const supabase = createSupabaseClient();

    let query = supabase.from('courses').select('*');

    // Apply pagination if provided
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 100) - 1);
    }

    const { data: courses, error } = await query;

    const typedCourses = courses as Course[] | null;

    if (error) {
      logger.error('Database error fetching courses', { error: error.message });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to fetch courses',
      });
      return;
    }

    logger.info('Courses fetched successfully', { count: typedCourses?.length || 0 });

    callback(null, {
      courses: typedCourses?.map(course => ({
        id: course.id,
        code: course.code,
        name: course.name,
        description: course.description,
      })) || [],
    });
  } catch (error: any) {
    logger.error('Unexpected error in ListCourses', { error: error.message });
    callback({
      code: grpc.status.INTERNAL,
      message: 'An error occurred while fetching courses',
    });
  }
}

/**
 * Handles ListSections requests by fetching sections for a course with faculty info.
 */
export async function handleListSections(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  const { course_id } = call.request;

  logger.info('ListSections request received', { course_id });

  if (!course_id) {
    logger.warn('ListSections failed: Missing course_id parameter');
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'course_id is required',
    });
    return;
  }

  try {
    const supabase = createSupabaseClient();
    const { data: sections, error } = await supabase
      .from('sections')
      .select(`
        *,
        faculty:users!faculty_id(name)
      `)
      .eq('course_id', course_id);

    const typedSections = sections as SectionWithDetails[] | null;

    if (error) {
      logger.error('Database error fetching sections', { error: error.message, course_id });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to fetch sections',
      });
      return;
    }

    logger.info('Sections fetched successfully', {
      count: typedSections?.length || 0,
      course_id
    });

    callback(null, {
      sections: typedSections?.map(section => ({
        id: section.id,
        course_id: section.course_id,
        section_code: section.section_code,
        faculty_id: section.faculty_id,
        faculty_name: section.faculty?.name || 'Unknown',
        max_capacity: section.max_capacity,
        enrolled_count: section.enrolled_count,
      })) || [],
    });
  } catch (error: any) {
    logger.error('Unexpected error in ListSections', { error: error.message, course_id });
    callback({
      code: grpc.status.INTERNAL,
      message: 'An error occurred while fetching sections',
    });
  }
}

/**
 * Handles EnrollStudent requests using atomic database transaction.
 * Business logic (capacity, duplicates) is handled by the database transaction.
 */
export async function handleEnrollStudent(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  const { student_id, section_id } = call.request;

  logger.info('EnrollStudent request received', { student_id, section_id });

  if (!student_id || !section_id) {
    logger.warn('EnrollStudent failed: Missing parameters');
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'student_id and section_id are required',
    });
    return;
  }

  try {
    const supabase = createSupabaseClient();

    // Call transactional function
    const { data, error } = await (supabase as any)
      .rpc('enroll_student_transactional', {
        p_student_id: student_id,
        p_section_id: section_id
      })
      .single();

    if (error) {
      logger.error('Enrollment transaction failed', {
        error: error.message,
        student_id,
        section_id
      });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to enroll student',
      });
      return;
    }

    const result = data as { success: boolean; message: string };

    if (!result.success) {
      logger.warn('Enrollment rejected', {
        reason: result.message,
        student_id,
        section_id
      });
      callback(null, {
        success: false,
        message: result.message,
      });
      return;
    }

    logger.info('Student enrolled successfully', { student_id, section_id });

    callback(null, {
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Unexpected error in EnrollStudent', {
      error: error.message,
      student_id,
      section_id
    });
    callback({
      code: grpc.status.INTERNAL,
      message: 'An error occurred while enrolling student',
    });
  }
}

/**
 * Handles GetEnrollments requests by fetching student's enrollments with course details.
 */
export async function handleGetEnrollments(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  const { student_id } = call.request;

  logger.info('GetEnrollments request received', { student_id });

  if (!student_id) {
    logger.warn('GetEnrollments failed: Missing student_id');
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'student_id is required',
    });
    return;
  }

  try {
    const supabase = createSupabaseClient();
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        section:sections!section_id(
          section_code,
          course:courses!course_id(
            id,
            code,
            name
          ),
          faculty:users!faculty_id(
            name
          )
        )
      `)
      .eq('student_id', student_id);

    const typedEnrollments = enrollments as EnrollmentWithDetails[] | null;

    if (error) {
      logger.error('Database error fetching enrollments', {
        error: error.message,
        student_id
      });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to fetch enrollments',
      });
      return;
    }

    logger.info('Enrollments fetched successfully', {
      count: typedEnrollments?.length || 0,
      student_id
    });

    callback(null, {
      enrollments: typedEnrollments?.map(enrollment => ({
        id: enrollment.id,
        student_id: enrollment.student_id,
        section_id: enrollment.section_id,
        course_id: enrollment.section?.course?.id || '',
        course_code: enrollment.section?.course?.code || '',
        course_name: enrollment.section?.course?.name || '',
        section_code: enrollment.section?.section_code || '',
        faculty_name: enrollment.section?.faculty?.name || '',
        enrolled_at: enrollment.enrolled_at,
      })) || [],
    });
  } catch (error: any) {
    logger.error('Unexpected error in GetEnrollments', {
      error: error.message,
      student_id
    });
    callback({
      code: grpc.status.INTERNAL,
      message: 'An error occurred while fetching enrollments',
    });
  }
}

/**
 * Handles GetFacultySections requests by fetching sections taught by a faculty member.
 */
export async function handleGetFacultySections(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  const { faculty_id } = call.request;

  logger.info('GetFacultySections request received', { faculty_id });

  if (!faculty_id) {
    logger.warn('GetFacultySections failed: Missing faculty_id');
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'faculty_id is required',
    });
    return;
  }

  try {
    const supabase = createSupabaseClient();
    const { data: sections, error } = await supabase
      .from('sections')
      .select(`
        id,
        course_id,
        section_code,
        max_capacity,
        enrolled_count,
        course:courses!course_id(code, name)
      `)
      .eq('faculty_id', faculty_id);

    const typedSections = sections as FacultySectionWithCourse[] | null;

    if (error) {
      logger.error('Database error fetching faculty sections', {
        error: error.message,
        faculty_id
      });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to fetch faculty sections',
      });
      return;
    }

    logger.info('Faculty sections fetched successfully', {
      count: typedSections?.length || 0,
      faculty_id
    });

    callback(null, {
      sections: typedSections?.map(section => ({
        id: section.id,
        course_id: section.course_id,
        course_code: section.course?.code || '',
        course_name: section.course?.name || '',
        section_code: section.section_code,
        max_capacity: section.max_capacity,
        enrolled_count: section.enrolled_count,
      })) || [],
    });
  } catch (error: any) {
    logger.error('Unexpected error in GetFacultySections', {
      error: error.message,
      faculty_id
    });
    callback({
      code: grpc.status.INTERNAL,
      message: 'An error occurred while fetching faculty sections',
    });
  }
}
