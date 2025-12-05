import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from './views/LoginPage';
import Courses from './views/Courses';
import Sections from "./views/Sections";
import Enrollments from "./views/Enrollments";
import ViewGrades from "./views/ViewGrades";
import FacultySections from "./views/FacultySections";
import ViewSectionGrades from "./views/ViewSectionGrades";
import EditSectionGrades from "./views/EditSectionGrades";

function App() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Student Route */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/sections/:courseId"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <Sections />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/enrollments"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <Enrollments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <ViewGrades />
            </ProtectedRoute>
          }
        />

        {/* Protected Faculty Route */}
        <Route
          path="/faculty/sections"
          element={
            <ProtectedRoute allowedRoles={["FACULTY"]}>
              <FacultySections />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/grades/:sectionId"
          element={
            <ProtectedRoute allowedRoles={["FACULTY"]}>
              <ViewSectionGrades />
            </ProtectedRoute>
          }
        />

<Route
          path="/faculty/students/:sectionId"
          element={
            <ProtectedRoute allowedRoles={["FACULTY"]}>
              <EditSectionGrades />
            </ProtectedRoute>
          }
        />

      <Route
        path="*"
        element={
          role === "STUDENT"
            ? <Navigate to="/courses" replace />
            : role === "FACULTY"
            ? <Navigate to="/faculty/sections" replace />
            : <Navigate to="/login" replace />
        }
      />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
