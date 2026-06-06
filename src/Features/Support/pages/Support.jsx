import React, { useState, useEffect } from "react";
import { createSupportLead } from "../services/supportService";
import { useAuth } from "../../auth/context/AuthContext"; // Import AuthContext
import "../styles/Support.css";

const CATEGORIES = [
  { value: "payment", label: "Thanh toán / Hoàn tiền" },
  { value: "course", label: "Vấn đề khóa học" },
  { value: "account", label: "Tài khoản & Đăng nhập" },
  { value: "technical", label: "Lỗi kỹ thuật" },
  { value: "other", label: "Khác" },
];

const Support = () => {
  const { user } = useAuth(); // Lấy thông tin user nếu đã đăng nhập

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    category: "",
    subject: "",
    content: "", // Đổi message -> content cho chuẩn API
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Tự động điền thông tin nếu User đã đăng nhập
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");

    try {
      await createSupportLead(formData);
      setSubmitted(true);

      // Reset form (giữ lại tên và email nếu là user đã login)
      setFormData({
        fullName: user?.fullName || "",
        email: user?.email || "",
        category: "",
        subject: "",
        content: "",
      });
    } catch (error) {
      setSubmitError(error.message || "Không thể gửi yêu cầu hỗ trợ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page">
      <div className="support-container">
        {/* Left: Form */}
        <div className="support-left">
          <div className="support-header">
            <h1>Hỗ trợ</h1>
            <p>Chúng tôi thường phản hồi qua Email trong vòng 24 giờ</p>
          </div>

          {submitted ? (
            <div className="submit-success">
              <div className="success-icon">✓</div>
              <h3>Đã gửi yêu cầu hỗ trợ!</h3>
              <p>
                Cảm ơn bạn. Đội ngũ Admin của Learnext sẽ kiểm tra và phản hồi
                lại bạn qua địa chỉ email <strong>{formData.email}</strong>{" "}
                trong thời gian sớm nhất.
              </p>
              <button
                className="btn-new-ticket"
                onClick={() => setSubmitted(false)}
              >
                Gửi yêu cầu mới
              </button>
            </div>
          ) : (
            <form className="support-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={changeHandler}
                    placeholder="Nhập họ và tên"
                    required
                    disabled={!!user} // Khóa ô nếu đã auto-fill từ Auth
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={changeHandler}
                    type="email"
                    placeholder="Nhập email"
                    required
                    disabled={!!user} // Khóa ô nếu đã auto-fill từ Auth
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Danh mục *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={changeHandler}
                  required
                >
                  <option value="">-- Chọn vấn đề --</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={changeHandler}
                  placeholder="Mô tả ngắn gọn vấn đề"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nội dung chi tiết *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={changeHandler}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                  rows={5}
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi yêu cầu hỗ trợ"}
              </button>
              {submitError && <p className="support-error">{submitError}</p>}
            </form>
          )}
        </div>

        {/* Right: FAQ (Đã xóa Ticket History) */}
        <div className="support-right">
          <div className="faq-section">
            <h3>Câu hỏi thường gặp</h3>
            <ul className="faq-list">
              <li>Làm thế nào để kích hoạt khóa học?</li>
              <li>Tại sao tài khoản của tôi chưa được duyệt học?</li>
              <li>Tôi muốn đăng ký làm giảng viên?</li>
              <li>Chính sách hoàn tiền như thế nào?</li>
              <li>Làm sao để lấy lại mật khẩu?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
