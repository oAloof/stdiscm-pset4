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
export function handleUploadGrade(call: any, callback: grpc.sendUnaryData<any>): void {
  const { student_id, section_id, grade_value, faculty_id } = call.request;

  logger.warn('UploadGrade handler not yet implemented', {
    student_id,
    section_id,
    grade_value,
    faculty_id
  });

  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'UploadGrade handler not yet implemented',
  });
}

/**
 * Handles GetSectionGrades requests - faculty view all grades for a specific section.
 */
export function handleGetSectionGrades(call: any, callback: grpc.sendUnaryData<any>): void {
  const { section_id, faculty_id } = call.request;

  logger.warn('GetSectionGrades handler not yet implemented', {
    section_id,
    faculty_id
  });

  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'GetSectionGrades handler not yet implemented',
  });
}
