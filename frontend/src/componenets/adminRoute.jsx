import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  console.log(user);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isSuperuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}