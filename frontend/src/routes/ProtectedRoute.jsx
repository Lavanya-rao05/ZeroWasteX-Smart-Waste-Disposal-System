import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" />;
    }

    const roleRouteMap = {
        resident: "/resident-dashboard",
        collector: "/collector-dashboard",
        admin: "/admin-dashboard",
    };

    const route = roleRouteMap[role] || "/login";

    return <Outlet />;
};

export default ProtectedRoute;
