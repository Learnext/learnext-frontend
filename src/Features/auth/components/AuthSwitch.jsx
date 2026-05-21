const AuthSwitch = ({ state, switchMode }) => {
  return state === "Login" ? (
    <p className="loginsignup-login">
      Don't have an account?{" "}
      <span onClick={() => switchMode("Sign Up")}>Sign Up</span>
    </p>
  ) : (
    <p className="loginsignup-login">
      Already have an account?{" "}
      <span onClick={() => switchMode("Login")}>Login now</span>
    </p>
  );
};

export default AuthSwitch;
