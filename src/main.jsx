import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./Features/auth/context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ReactNotifications />
      <App />
    </AuthProvider>
  </StrictMode>,
);
