import dotenv from 'dotenv';
import { startGrpcServer } from './grpc-server';

dotenv.config();

startGrpcServer();
