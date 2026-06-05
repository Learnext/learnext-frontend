import { useState } from "react";
import { activateCourse } from "../services/activationService";
import "../styles/AccountPages.css";

const Activate = () => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Activating...");
    try {
      const enrollment = await activateCourse(code);
      setStatus(`Activated ${enrollment.courseTitle || "course"}`);
      setCode("");
    } catch (error) {
      setStatus(error.message === "LOGIN_REQUIRED" ? "Login required" : error.message);
    }
  };

  return (
    <main className="account-page">
      <section className="account-panel account-narrow">
        <h1>Activate course</h1>
        <form className="account-form" onSubmit={handleSubmit}>
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Activation code" required />
          <button type="submit">Activate</button>
        </form>
        {status && <p className="account-status">{status}</p>}
      </section>
    </main>
  );
};

export default Activate;
