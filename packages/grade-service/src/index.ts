import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.GRPC_PORT || 50053;

console.log('Starting Grade Service...');
console.log(`gRPC server will listen on port ${PORT}`);

// TODO: Implement gRPC server
console.log('Grade Service implementation pending');
