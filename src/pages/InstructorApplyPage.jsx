import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError, notifySuccess } from "../utils/notify";

const API = "http://localhost:1201/api/v1";

const getContentType = (file) => file.type || "application/pdf";

const uploadSigned = async (file, token) => {
  const signRes = await fetch(`${API}/uploads/signed-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: getContentType(file),
      size: file.size,
    }),
  });
  const signJson = await signRes.json();
  if (!signRes.ok || !signJson.success) {
    throw new Error(signJson.error?.message || "Không thể tạo signed URL");
  }
  const signed = signJson.data;
  const uploadRes = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": getContentType(file) },
    body: file,
  });
  if (!uploadRes.ok) throw new Error("Upload bằng cấp thất bại");
  return signed.publicUrl;
};

const InstructorApplyPage = () => {
  const navigate = useNavigate();
  const [qualification, setQualification] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!qualification.trim() || !phone.trim() || !file) {
      notifyError("Vui lòng nhập trình độ, số điện thoại và tải bằng cấp/chứng chỉ.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("auth-token");
      const certificateUrl = await uploadSigned(file, token);
      const res = await fetch(`${API}/instructor-applications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qualification, phone, bio, certificateUrl }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Gửi hồ sơ thất bại");
      }
      notifySuccess("Đã gửi hồ sơ giảng viên. Vui lòng chờ quản trị viên duyệt.");
      navigate("/profile");
    } catch (err) {
      notifyError(err.message || "Không thể gửi hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
      <h1>Đăng ký làm giảng viên</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <label>
          Trình độ / chuyên môn
          <input
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            style={{ width: "100%", padding: 12, marginTop: 8 }}
          />
        </label>
        <label>
          Số điện thoại
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: "100%", padding: 12, marginTop: 8 }}
          />
        </label>
        <label>
          Giới thiệu kinh nghiệm
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            style={{ width: "100%", padding: 12, marginTop: 8 }}
          />
        </label>
        <label>
          Bằng cấp / chứng chỉ
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ display: "block", marginTop: 8 }}
          />
        </label>
        <button disabled={loading} style={{ padding: 12 }}>
          {loading ? "Đang gửi..." : "Gửi hồ sơ"}
        </button>
      </form>
    </div>
  );
};

export default InstructorApplyPage;
