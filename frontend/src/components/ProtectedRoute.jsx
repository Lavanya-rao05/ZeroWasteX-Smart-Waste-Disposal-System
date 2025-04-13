import { useLocation, Navigate, Outlet } from "react-router-dom";
import React from "react";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // 🚨 Allow public routes even without token
  const publicPaths = ["/reset-password"];
  const isResetRoute = publicPaths.some((path) => location.pathname.startsWith(path));

  if (isResetRoute) {
    return <Outlet />;
  }

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
