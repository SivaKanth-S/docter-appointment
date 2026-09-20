import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // redirect to correct portal
    if (user.role === "ROLE_ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "ROLE_DOCTOR") return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }
  return children;
}
