import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    console.log("  Bắt đầu đăng nhập với:", formData.email);
    try {
      // =============================================
      // [GIẢ LẬP] Dùng khi chưa có backend - xóa khi BE xong
      //await new Promise((res) => setTimeout(res, 800));
      //const data = { success: true, token: "fake-token-123" };
      // =============================================

      // =============================================

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      // =============================================

      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        window.location.replace("/");
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Không thể kết nối server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const signup = async () => {
    setLoading(true);
    try {
      // =============================================
      // [GIẢ LẬP] Dùng khi chưa có backend - xóa khi BE xong
      // await new Promise((res) => setTimeout(res, 800));
      // const data = { success: true, token: "fake-token-456" };
      // =============================================

      // =============================================
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      // =============================================

      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        window.location.replace("/");
      } else {
        setError(data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Không thể kết nối server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (state === "Login") {
      login();
    } else {
      signup();
    }
  };

  const switchMode = (newState) => {
    setState(newState);
    setError("");
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

          {error && (
            <p style={{ color: "red", fontSize: "14px", margin: "8px 0" }}>
              {error}
            </p>
          )}

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
            <span onClick={() => switchMode("Login")}>Login</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
