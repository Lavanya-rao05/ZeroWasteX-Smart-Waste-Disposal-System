import React from "react";
import { Routes, Route } from "react-router-dom";
import ResidentDashboard from "./pages/ResidentDashboard";
import CollectorDashboard from "./pages/CollectorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CenterDashboard from "./pages/CenterDashBoard";
import ResetPassword from "./pages/ResetPassword";
import "leaflet/dist/leaflet.css";

const App = () => {
  return (
    <Routes>
      {/* ✅ This route must be public! */}
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* 🔒 Protected routes below */}
      <Route element={<ProtectedRoute />}>
        <Route path="/resident-dashboard" element={<ResidentDashboard />} />
        <Route path="/collector-dashboard" element={<CollectorDashboard />} />
        <Route path="/center-dashboard" element={<CenterDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};

export default App;
