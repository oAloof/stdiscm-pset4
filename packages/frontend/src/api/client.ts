// API client for communicating with the API Gateway

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000';

// TODO: Implement API client functions
// - login(email, password)
// - logout()
// - getCourses()
// - getSections(courseId)
// - enrollInSection(sectionId)
// - getGrades()
// - uploadGrade(studentId, sectionId, gradeValue)

export const api = {
  baseUrl: API_BASE_URL,
};
