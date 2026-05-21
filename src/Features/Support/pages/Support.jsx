import React, { useState } from "react";
import "../styles/Support.css";

const CATEGORIES = [
  { value: "payment", label: "Thanh toán / Hoàn tiền" },
  { value: "course", label: "Vấn đề khóa học" },
  { value: "account", label: "Tài khoản & Đăng nhập" },
  { value: "technical", label: "Lỗi kỹ thuật" },
  { value: "other", label: "Khác" },
];

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([
    // Mock ticket history
    {
      id: "TK-001",
      subject: "Không xem được video bài học",
      category: "technical",
      status: "resolved",
      date: "20/04/2026",
    },
  ]);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((res) => setTimeout(res, 1000));

    const newTicket = {
      id: `TK-00${tickets.length + 2}`,
      subject: formData.subject,
      category: formData.category,
      status: "pending",
      date: new Date().toLocaleDateString("vi-VN"),
    };

    setTickets([newTicket, ...tickets]);
    setSubmitted(true);
    setLoading(false);
    setFormData({
      name: "",
      email: "",
      category: "",
      subject: "",
      message: "",
    });
  };

  const handleNewTicket = () => {
    setSubmitted(false);
  };

  const statusLabel = (status) => {
    switch (status) {
      case "pending":
        return { text: "Đang xử lý", cls: "status-pending" };
      case "resolved":
        return { text: "Đã giải quyết", cls: "status-resolved" };
      case "closed":
        return { text: "Đã đóng", cls: "status-closed" };
      default:
        return { text: status, cls: "" };
    }
  };

  return (
    <div className="support-page">
      <div className="support-container">
        {/* Left: Form */}
        <div className="support-left">
          <div className="support-header">
            <h1>Hỗ trợ</h1>
            <p>Chúng tôi thường phản hồi trong vòng 24 giờ</p>
          </div>

          {submitted ? (
            <div className="submit-success">
              <div className="success-icon">✓</div>
              <h3>Đã gửi yêu cầu hỗ trợ!</h3>
              <p>
                Chúng tôi sẽ phản hồi qua email của bạn trong vòng 24 giờ làm
                việc.
              </p>
              <button className="btn-new-ticket" onClick={handleNewTicket}>
                Gửi yêu cầu mới
              </button>
            </div>
          ) : (
            <form className="support-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={changeHandler}
                    placeholder="Nhập họ và tên"
                    required
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
                <label>Nội dung *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={changeHandler}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                  rows={5}
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi yêu cầu hỗ trợ"}
              </button>
            </form>
          )}
        </div>

        {/* Right: Ticket history + FAQ */}
        <div className="support-right">
          {/* Ticket history */}
          <div className="ticket-history">
            <h3>Lịch sử yêu cầu</h3>
            {tickets.length === 0 ? (
              <p className="no-tickets">Chưa có yêu cầu nào.</p>
            ) : (
              <div className="ticket-list">
                {tickets.map((t) => {
                  const s = statusLabel(t.status);
                  return (
                    <div key={t.id} className="ticket-item">
                      <div className="ticket-top">
                        <span className="ticket-id">{t.id}</span>
                        <span className={`ticket-status ${s.cls}`}>
                          {s.text}
                        </span>
                      </div>
                      <p className="ticket-subject">{t.subject}</p>
                      <span className="ticket-date">{t.date}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FAQ quick links */}
          <div className="faq-section">
            <h3>Câu hỏi thường gặp</h3>
            <ul className="faq-list">
              <li>Làm thế nào để đăng ký khóa học?</li>
              <li>Chính sách hoàn tiền như thế nào?</li>
              <li>Tôi có thể xem video offline không?</li>
              <li>Làm sao để liên hệ giảng viên?</li>
              <li>Chứng chỉ có giá trị không?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
