import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];  // <-- NEW
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const userJson = localStorage.getItem("user");

  if (!userJson) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userJson);

  // Not logged in → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "STUDENT") return <Navigate to="/courses" replace />;
    if (user.role === "FACULTY") return <Navigate to="/faculty" replace />;
    
    // Fallback for unexpected roles
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
