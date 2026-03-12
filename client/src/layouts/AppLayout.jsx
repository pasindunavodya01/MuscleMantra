import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <header className="header">
        <div className="header__inner container">
          <Link className="brand" to="/">
            GymMS
          </Link>
          <nav className="nav">
            {isAuthenticated ? (
              <>
                <span className="nav__text">{user?.name}</span>
                <button
                  className="btn btn--ghost"
                  onClick={() => navigate(user?.role === "admin" ? "/admin" : "/member")}
                >
                  Dashboard
                </button>
                <button
                  className="btn btn--primary"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link className="btn btn--primary" to="/login">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container main">
        <Outlet />
      </main>
    </div>
  );
}

