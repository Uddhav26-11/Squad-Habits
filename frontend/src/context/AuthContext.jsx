import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Always re-fetches the CURRENT authenticated user from the backend using
  // whatever token is in this tab's sessionStorage. Never trusts any cached
  // user object — the only thing persisted is the token; the user object
  // always comes fresh from /api/auth/me.
  const loadUser = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.log("[AuthContext] No token in sessionStorage — not authenticated");
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      console.log("[AuthContext] Fetching current user from /auth/me...");
      const res = await api.get("/auth/me");
      console.log("[AuthContext] Loaded user:", res.data.user?.email);
      setUser(res.data.user);
    } catch (err) {
      console.error("[AuthContext] Failed to load user, clearing token:", err.response?.data || err.message);
      sessionStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on every app initialization/mount — e.g. on a hard refresh —
  // so we never render a stale cached user.
  useEffect(() => {
    loadUser();
  }, []);

  const login = async (token) => {
    setUser(null);
    sessionStorage.setItem("token", token);
    console.log("[AuthContext] New token stored for this tab, reloading user...");
    await loadUser();
    // Return whether login actually succeeded, so callers (AuthCallback)
    // can react instead of blindly navigating forward on failure.
    return !!sessionStorage.getItem("token");
  };

  const logout = () => {
    console.log("[AuthContext] Logging out — clearing token and user state");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}