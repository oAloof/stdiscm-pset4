import * as grpc from '@grpc/grpc-js';
import { createSupabaseClient, createLogger, Course } from '@pset4/shared-types';

const logger = createLogger('course-handler');

/**
 * Handles ListCourses requests by fetching all courses from database.
 */
export async function handleListCourses(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  logger.info('ListCourses request received');

  try {
    const supabase = createSupabaseClient();
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*');

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

    const typedSections = sections as any[] | null;

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
 * All business logic (capacity, duplicates, increment) handled in database.
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

/** Placeholder for GetEnrollments RPC. */
export function handleGetEnrollments(call: any, callback: grpc.sendUnaryData<any>): void {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'GetEnrollments handler not yet implemented',
  });
}
