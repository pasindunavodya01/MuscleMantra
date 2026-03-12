import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { api, setAuthToken } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "gym.token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    async function boot() {
      try {
        if (!token) {
          if (isMounted) setUser(null);
          return;
        }
        const res = await api.get("/auth/me");
        if (isMounted) setUser(res.data.user);
      } catch {
        if (isMounted) {
          setUser(null);
          setToken("");
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (isMounted) setIsBooting(false);
      }
    }

    boot();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    const nextToken = res.data.token;
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isBooting,
      isAuthenticated: Boolean(token && user),
      login,
      logout
    }),
    [token, user, isBooting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

