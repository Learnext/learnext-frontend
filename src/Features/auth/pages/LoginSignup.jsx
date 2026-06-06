import "../styles/LoginSignup.css";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import AuthForm from "../components/AuthForm";
import AuthSwitch from "../components/AuthSwitch";

import { loginService, signupService } from "../services/authService";
import { useAuthForm } from "../hooks/useAuthForm";

const LoginSignup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    state,
    loading,
    setLoading,
    error,
    setError,
    formData,
    changeHandler,
    switchMode,
  } = useAuthForm();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data =
        state === "Login"
          ? await loginService(formData.email, formData.password)
          : await signupService(formData);

      if (!data.success) {
        setError(data.message);
        return;
      }

      login(data.token, data.user);

      if (state === "Sign Up") {
        alert("Đăng ký thành công!");
      }

      const redirectPath = localStorage.getItem("redirect-after-login");
      if (redirectPath) {
        localStorage.removeItem("redirect-after-login");
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>

        <AuthForm
          state={state}
          formData={formData}
          changeHandler={changeHandler}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
        />

        <AuthSwitch state={state} switchMode={switchMode} />
      </div>
    </div>
  );
};

export default LoginSignup;
