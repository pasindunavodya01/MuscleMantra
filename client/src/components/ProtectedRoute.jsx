import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { isBooting, isAuthenticated, user } = useAuth();

  if (isBooting) return <div className="container">Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/member"} replace />;
  }

  return children;
}

