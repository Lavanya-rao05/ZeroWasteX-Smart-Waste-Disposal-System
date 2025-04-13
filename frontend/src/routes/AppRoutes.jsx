import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResidentDashboard from "../pages/resident/ResidentDashboard";
import CollectorDashboard from "../pages/collector/CollectorDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import ResetPassword from "../pages/auth/ResetPassword";
import "leaflet/dist/leaflet.css";


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/resident-dashboard" element={<ResidentDashboard />} />
          <Route path="/collector-dashboard" element={<CollectorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
