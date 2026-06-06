import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { notifyError, notifySuccess } from "../utils/notify";
import apiFetch from "../utils/apiFetch";

const rawApiUrl = import.meta.env.VITE_API_URL;
const API = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`
  : "http://localhost:1201/api/v1";

const ActivatePage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Dang kich hoat khoa hoc...");
  // Chống StrictMode chạy effect 2 lần -> tránh tạo enrollment trùng
  const hasActivated = useRef(false);

  useEffect(() => {
    if (hasActivated.current) return;
    const code = params.get("code");
    const token = localStorage.getItem("auth-token");
    if (!code) {
      setStatus("Link kich hoat khong hop le.");
      return;
    }
    if (!token) {
      localStorage.setItem("redirect-after-login", `/activate?code=${encodeURIComponent(code)}`);
      navigate("/login");
      return;
    }

    hasActivated.current = true;
    const activate = async () => {
      try {
        const res = await apiFetch(`${API}/activations/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activationCode: code }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Kich hoat that bai");
        }
        notifySuccess("Khoa hoc da duoc kich hoat.");
        navigate("/my-courses");
      } catch (err) {
        setStatus(err.message || "Khong the kich hoat khoa hoc.");
        notifyError(err.message || "Khong the kich hoat khoa hoc.");
      }
    };

    activate();
  }, [navigate, params]);

  return <div style={{ maxWidth: 720, margin: "80px auto", padding: 24 }}>{status}</div>;
};

export default ActivatePage;
