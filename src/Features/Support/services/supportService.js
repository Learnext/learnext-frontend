const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1")
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : "http://localhost:1201/api/v1";

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "success" in payload) {
    return payload.data;
  }
  return payload;
};

export const createSupportLead = async (data) => {
  // Chuẩn bị payload chuẩn gửi cho BE

  const requestBody = {
    name: data.fullName, // Tên cột trong ERD là 'name'
    email: data.email,
    category: data.category,
    subject: data.subject,
    message: data.content, // Tên cột trong ERD là 'message'
  };
  // ... phần còn lại giữ nguyên

  const headers = {
    "Content-Type": "application/json",
  };

  // Thêm Auth token nếu User đang đăng nhập (giúp Backend gán UserID tự động)
  const token = localStorage.getItem("auth-token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/support/leads`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(requestBody),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        payload?.message ||
        "Không thể gửi yêu cầu hỗ trợ lúc này.",
    );
  }

  return unwrap(payload);
};
