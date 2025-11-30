import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.GRPC_PORT || 50051;

console.log('Starting Auth Service...');
console.log(`gRPC server will listen on port ${PORT}`);

// TODO: Implement gRPC server for AuthService
// TODO: Implement Login, Logout, ValidateToken handlers
console.log('Auth Service implementation pending');
