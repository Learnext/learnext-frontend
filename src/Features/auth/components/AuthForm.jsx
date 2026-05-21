const AuthForm = ({
  state,
  formData,
  changeHandler,
  handleSubmit,
  loading,
  error,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="loginsignup-fields">
        {state === "Sign Up" && (
          <input
            name="username"
            value={formData.username}
            onChange={changeHandler}
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

      <button type="submit" disabled={loading}>
        {loading ? "Please wait..." : "Continue"}
      </button>
    </form>
  );
};

export default AuthForm;
