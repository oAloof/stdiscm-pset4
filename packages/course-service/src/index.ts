import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.GRPC_PORT || 50052;

console.log('Starting Course Service...');
console.log(`gRPC server will listen on port ${PORT}`);

// TODO: Implement gRPC server for CourseService
// TODO: Implement ListCourses, ListSections, EnrollStudent, GetEnrollments handlers
console.log('Course Service implementation pending');
