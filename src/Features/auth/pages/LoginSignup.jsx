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

    try {
      const data =
        state === "Login"
          ? await loginService(formData.email, formData.password)
          : await signupService(formData);

      if (data.success) {
        login(data.token, data.user);

        navigate(data.user.isInstructor ? "/instructor" : "/");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Không thể kết nối server");
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
