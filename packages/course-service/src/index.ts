import dotenv from 'dotenv';
import { createLogger } from '@pset4/shared-types';

dotenv.config();

const logger = createLogger('course-service');
const PORT = process.env.GRPC_PORT || 50052;

logger.info('Starting Course Service...');
logger.info(`gRPC server will listen on port ${PORT}`);
logger.warn('Course Service implementation pending');
