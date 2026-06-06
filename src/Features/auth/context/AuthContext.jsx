import { createContext, useContext, useState } from "react";
import { logoutService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = (token, userData) => {
    const instructorId = localStorage.getItem("instructorId");

    const normalizedUser = {
      ...userData,
      isInstructor:
        userData.role === "instructor" ||
        userData.role === "INSTRUCTOR" ||
        Boolean(instructorId),
    };

    localStorage.setItem("auth-token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
