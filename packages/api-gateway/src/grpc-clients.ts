import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { createLogger } from '@pset4/shared-types';

const PROTO_PATH = path.resolve(__dirname, '../../proto/enrollment.proto');
const logger = createLogger('grpc-clients');

function loadProtoDefinition() {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return grpc.loadPackageDefinition(packageDefinition);
}

function createAuthClient() {
  const host = process.env.AUTH_SERVICE_HOST || 'localhost';
  const port = process.env.AUTH_SERVICE_PORT || '50051';
  const address = `${host}:${port}`;

  try {
    const proto: any = loadProtoDefinition();
    const client = new proto.enrollment.AuthService(
      address,
      grpc.credentials.createInsecure()
    );

    logger.info('Auth Service client created', { address });
    return client;
  } catch (error: any) {
    logger.error('Failed to create Auth Service client', {
      address,
      error: error.message,
    });
    throw error;
  }
}

function createCourseClient() {
  const host = process.env.COURSE_SERVICE_HOST || 'localhost';
  const port = process.env.COURSE_SERVICE_PORT || '50052';
  const address = `${host}:${port}`;

  try {
    const proto: any = loadProtoDefinition();
    const client = new proto.enrollment.CourseService(
      address,
      grpc.credentials.createInsecure()
    );

    logger.info('Course Service client created', { address });
    return client;
  } catch (error: any) {
    logger.error('Failed to create Course Service client', {
      address,
      error: error.message,
    });
    throw error;
  }
}

function createGradeClient() {
  const host = process.env.GRADE_SERVICE_HOST || 'localhost';
  const port = process.env.GRADE_SERVICE_PORT || '50053';
  const address = `${host}:${port}`;

  try {
    const proto: any = loadProtoDefinition();
    const client = new proto.enrollment.GradeService(
      address,
      grpc.credentials.createInsecure()
    );

    logger.info('Grade Service client created', { address });
    return client;
  } catch (error: any) {
    logger.error('Failed to create Grade Service client', {
      address,
      error: error.message,
    });
    throw error;
  }
}

// Create and export client instances
export const authClient = createAuthClient();
export const courseClient = createCourseClient();
export const gradeClient = createGradeClient();

logger.info('All gRPC clients initialized successfully');
