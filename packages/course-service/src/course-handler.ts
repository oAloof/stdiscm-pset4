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

/** Placeholder for ListSections RPC. */
export function handleListSections(call: any, callback: grpc.sendUnaryData<any>): void {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'ListSections handler not yet implemented',
  });
}

/** Placeholder for EnrollStudent RPC. */
export function handleEnrollStudent(call: any, callback: grpc.sendUnaryData<any>): void {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'EnrollStudent handler not yet implemented',
  });
}

/** Placeholder for GetEnrollments RPC. */
export function handleGetEnrollments(call: any, callback: grpc.sendUnaryData<any>): void {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'GetEnrollments handler not yet implemented',
  });
}
