import { createContext, useContext, useState, useEffect } from "react";
import { showToast } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => ({
    token: localStorage.getItem("jwt_token"),
    username: localStorage.getItem("current_user"),
    role: localStorage.getItem("user_role"),
  }));

  const isAuthenticated = !!user.token;

  const login = (authData) => {
    if (authData.token) localStorage.setItem("jwt_token", authData.token);
    if (authData.username) localStorage.setItem("current_user", authData.username);
    if (authData.role) localStorage.setItem("user_role", authData.role);
    setUser({
      token: authData.token,
      username: authData.username,
      role: authData.role,
    });
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("current_user");
    localStorage.removeItem("user_role");
    setUser({ token: null, username: null, role: null });
    showToast("Logged out successfully", "info");
  };

  const setSession = (authData) => login(authData);

  // sync across tabs
  useEffect(() => {
    const onStorage = () => {
      setUser({
        token: localStorage.getItem("jwt_token"),
        username: localStorage.getItem("current_user"),
        role: localStorage.getItem("user_role"),
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
