import { useState } from "react";

export const useAuthForm = () => {
  const [state, setState] = useState("Login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const switchMode = (mode) => {
    setState(mode);
    setError("");
    setLoading(false);

    setFormData({
      username: "",
      email: "",
      password: "",
    });
  };

  return {
    state,
    setState,
    loading,
    setLoading,
    error,
    setError,
    formData,
    setFormData,
    changeHandler,
    switchMode,
  };
};
