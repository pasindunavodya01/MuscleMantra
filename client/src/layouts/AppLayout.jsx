import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Roboto:wght@300;400;700&display=swap');

  .app-header {
    background: #212121;
    height: 70px;
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    border-bottom: 2px solid #ff5722;
  }

  .header-inner {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand-link {
    font-size: 1.8rem;
    font-weight: 700;
    font-family: 'Oswald', sans-serif;
    cursor: pointer;
    text-decoration: none;
    color: #f5f5f5;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.3s ease;
  }

  .brand-link:hover {
    color: #ff5722;
    text-shadow: 0 0 10px rgba(255, 87, 34, 0.3);
  }

  .nav-menu {
    display: flex;
    align-items: center;
    gap: 20px;
    list-style: none;
  }

  .nav-user-name {
    color: #76ff03;
    font-weight: 600;
    font-family: 'Oswald', sans-serif;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }

  .nav-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 0.5px;
    text-decoration: none;
    display: inline-block;
  }

  .nav-btn-primary {
    background: #ff5722;
    color: #fff;
  }

  .nav-btn-primary:hover {
    background: #e64a19;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 87, 34, 0.3);
  }

  .nav-btn-ghost {
    background: transparent;
    color: #bdbdbd;
    border: 2px solid #444;
  }

  .nav-btn-ghost:hover {
    color: #76ff03;
    border-color: #76ff03;
    background: rgba(118, 255, 3, 0.05);
  }

  .nav-link {
    color: #f5f5f5;
    text-decoration: none;
    background: #ff5722;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    transition: all 0.3s ease;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 0.5px;
    display: inline-block;
  }

  .nav-link:hover {
    background: #e64a19;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 87, 34, 0.3);
  }

  .app-main {
    min-height: calc(100vh - 70px);
    background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%);
    padding: 40px 20px;
  }

  .main-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    .brand-link {
      font-size: 1.3rem;
    }

    .nav-menu {
      gap: 10px;
      flex-wrap: wrap;
    }

    .nav-btn, .nav-link {
      padding: 8px 14px;
      font-size: 0.8rem;
    }

    .nav-user-name {
      font-size: 0.8rem;
    }
  }
`;

export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>
      <div>
        <header className="app-header">
          <div className="header-inner">
            <Link className="brand-link" to="/">
              GymMS
            </Link>
            <nav className="nav-menu">
              {isAuthenticated ? (
                <>
                  <span className="nav-user-name">{user?.name}</span>
                  <button
                    className="nav-btn nav-btn-ghost"
                    onClick={() => navigate(user?.role === "admin" ? "/admin" : "/member")}
                  >
                    Dashboard
                  </button>
                  <button
                    className="nav-btn nav-btn-primary"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="app-main">
          <div className="main-container">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

