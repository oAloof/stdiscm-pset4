import dotenv from 'dotenv';
import { createLogger } from '@pset4/shared-types';

dotenv.config();

const logger = createLogger('grade-service');
const PORT = process.env.GRPC_PORT || 50053;

logger.info('Starting Grade Service...');
logger.info(`gRPC server will listen on port ${PORT}`);
logger.warn('Grade Service implementation pending');
