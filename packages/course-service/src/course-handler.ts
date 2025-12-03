import * as grpc from '@grpc/grpc-js';

/** Placeholder for ListCourses RPC. */
export function handleListCourses(call: any, callback: grpc.sendUnaryData<any>): void {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'ListCourses handler not yet implemented',
  });
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
