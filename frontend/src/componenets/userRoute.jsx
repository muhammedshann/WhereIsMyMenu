import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  if (user?.is_superuser) {
    return <Navigate to="/admin" />;
  }

  return children;
}