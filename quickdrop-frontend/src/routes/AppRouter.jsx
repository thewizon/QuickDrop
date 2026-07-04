import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ProtectedRoute from "./ProtectedRoute";

import AdminDashboard from "../pages/Admin/Dashboard";
import CustomerDashboard from "../pages/Customer/Dashboard";
import AgentDashboard from "../pages/Agent/Dashboard";

import LandingPage from "../pages/Landing/LandingPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Customer */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute roles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Agent */}
        <Route
          path="/agent/dashboard"
          element={
            <ProtectedRoute roles={["agent"]}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}