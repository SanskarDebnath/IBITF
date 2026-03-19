import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function RequireRole({ allowed = [] }) {
  const { role } = useAuth();

  if (!allowed.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
