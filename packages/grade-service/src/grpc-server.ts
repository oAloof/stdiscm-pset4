import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { createLogger } from '@pset4/shared-types';
import { handleGetGrades, handleUploadGrade, handleGetSectionGrades } from './grade-handler';

const PROTO_DIR = process.env.PROTO_DIR || path.resolve(__dirname, '../../proto');
const PROTO_PATH = path.join(PROTO_DIR, 'enrollment.proto');
const logger = createLogger('grade-service');

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

function createServer(): grpc.Server {
  const server = new grpc.Server();
  const proto: any = loadProtoDefinition();

  server.addService(proto.enrollment.GradeService.service, {
    GetGrades: handleGetGrades,
    UploadGrade: handleUploadGrade,
    GetSectionGrades: handleGetSectionGrades,
  });

  return server;
}

/**
 * Starts the gRPC server.
 */
export function startGrpcServer(): void {
  const PORT = process.env.GRPC_PORT || '50053';
  const HOST = '0.0.0.0';

  logger.info('Starting Grade Service...');
  logger.info(`Loading proto file from: ${PROTO_PATH}`);

  const server = createServer();

  server.bindAsync(
    `${HOST}:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        logger.error('Failed to start gRPC server', { error: error.message });
        process.exit(1);
      }

      logger.info(`gRPC server listening on ${HOST}:${port}`);
      server.start();
    }
  );

  const shutdown = () => {
    logger.info('Shutting down gRPC server...');
    server.forceShutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
