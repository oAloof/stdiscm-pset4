import path from 'path';
import dotenv from 'dotenv';
import { startGrpcServer } from './grpc-server';

// Load .env from root directory for local development
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); 

startGrpcServer();
