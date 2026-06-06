import { createContext, useContext, useState } from "react";

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
    const normalizedUser = {
      ...userData,
      isInstructor: userData.role === "instructor",
    };

    localStorage.setItem("auth-token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("user");
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
