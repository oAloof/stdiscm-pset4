import * as grpc from '@grpc/grpc-js';
import { createLogger } from '@pset4/shared-types';

const logger = createLogger('grade-handler');

/**
 * Handles GetGrades requests - students view their grades across all enrolled sections.
 */
export function handleGetGrades(call: any, callback: grpc.sendUnaryData<any>): void {
  const { student_id } = call.request;

  logger.warn('GetGrades handler not yet implemented', { student_id });

  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'GetGrades handler not yet implemented',
  });
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
