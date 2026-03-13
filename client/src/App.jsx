import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MemberDashboardPage from "./pages/MemberDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/member"
        element={
          <ProtectedRoute roles={["member"]}>
            <MemberDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function DashboardRedirect() {
  const { isBooting, isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (isBooting) return <div className="container">Loading...</div>;
  if (!isAuthenticated) return <Navigate to={`/login${location.search}`} replace />;
  return <Navigate to={`${user?.role === "admin" ? "/admin" : "/member"}${location.search}`} replace />;
}

