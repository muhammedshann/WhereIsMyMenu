import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (user.is_superuser || user.is_staff) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}