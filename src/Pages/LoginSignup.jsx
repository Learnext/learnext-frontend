import React, { useState } from "react";
import "./CSS/LoginSignup.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const login = async () => {
    setLoading(true);
    try {
      let data;

      if (!API_URL) {
        await new Promise((res) => setTimeout(res, 800));
        data = {
          success: true,
          token: "fake-token",
          user: {
            username: "Demo User",
            email: formData.email,
            role: "user",
          },
        };
      } else {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        data = await response.json();
      }

      if (data?.success) {
        authLogin(data.token, data.user); // ✅ dùng context, tự lưu localStorage + update state
        navigate("/");
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const signup = async () => {
    setLoading(true);
    try {
      let data;

      if (!API_URL) {
        await new Promise((res) => setTimeout(res, 800));
        data = {
          success: true,
          token: "fake-token",
          user: {
            username: formData.username,
            email: formData.email,
            role: "user",
          },
        };
      } else {
        const response = await fetch(`${API_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        data = await response.json();
      }

      if (data?.success) {
        authLogin(data.token, data.user); // ✅ dùng context
        navigate("/");
      } else {
        setError(data?.message || "Đăng ký thất bại");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    state === "Login" ? login() : signup();
  };

  const switchMode = (newState) => {
    setState(newState);
    setError("");
    setLoading(false);
    setFormData({ username: "", email: "", password: "" });
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>

        <form onSubmit={handleSubmit}>
          <div className="loginsignup-fields">
            {state === "Sign Up" && (
              <input
                name="username"
                value={formData.username}
                onChange={changeHandler}
                type="text"
                placeholder="Your Name"
                required
              />
            )}

            <input
              name="email"
              value={formData.email}
              onChange={changeHandler}
              type="email"
              placeholder="Email"
              required
            />

            <input
              name="password"
              value={formData.password}
              onChange={changeHandler}
              type="password"
              placeholder="Password"
              required
            />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {state === "Sign Up" && (
            <div className="loginsignup-agree">
              <input type="checkbox" required />
              <p>By continuing, I agree to the Terms & Conditions</p>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Continue"}
          </button>
        </form>

        {state === "Login" ? (
          <p className="loginsignup-login">
            Don't have an account?{" "}
            <span onClick={() => switchMode("Sign Up")}>Sign Up</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Already have an account?{" "}
            <span onClick={() => switchMode("Login")}>Login now</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
