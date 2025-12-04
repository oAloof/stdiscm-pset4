import { status } from '@grpc/grpc-js';

export const mapGrpcToHttpStatus = (grpcCode: number): { status: number; message: string } => {
  switch (grpcCode) {
    case status.OK:
      return { status: 200, message: 'OK' };
    case status.CANCELLED:
      return { status: 499, message: 'Client Closed Request' };
    case status.UNKNOWN:
      return { status: 500, message: 'Internal Server Error' };
    case status.INVALID_ARGUMENT:
      return { status: 400, message: 'Bad Request' };
    case status.DEADLINE_EXCEEDED:
      return { status: 504, message: 'Gateway Timeout' };
    case status.NOT_FOUND:
      return { status: 404, message: 'Not Found' };
    case status.ALREADY_EXISTS:
      return { status: 409, message: 'Conflict' };
    case status.PERMISSION_DENIED:
      return { status: 403, message: 'Forbidden' };
    case status.RESOURCE_EXHAUSTED:
      return { status: 429, message: 'Too Many Requests' };
    case status.FAILED_PRECONDITION:
      return { status: 400, message: 'Precondition Failed' };
    case status.ABORTED:
      return { status: 409, message: 'Conflict' };
    case status.OUT_OF_RANGE:
      return { status: 400, message: 'Bad Request' };
    case status.UNIMPLEMENTED:
      return { status: 501, message: 'Not Implemented' };
    case status.INTERNAL:
      return { status: 500, message: 'Internal Server Error' };
    case status.UNAVAILABLE:
      return { status: 503, message: 'Service Unavailable' };
    case status.DATA_LOSS:
      return { status: 500, message: 'Internal Server Error' };
    case status.UNAUTHENTICATED:
      return { status: 401, message: 'Unauthorized' };
    default:
      return { status: 500, message: 'Internal Server Error' };
  }
};
