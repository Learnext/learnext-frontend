import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import "./CSS/CheckoutPage.css";
import { useAuth } from "../Features/auth/context/AuthContext";

const API = "http://localhost:1201/api/v1";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Lấy dữ liệu khóa học được truyền từ trang CourseDetail
  const { state: targetCourse } = useLocation();

  const [loading, setLoading] = useState(false);
  // Lưu data order do Backend trả về
  const [orderData, setOrderData] = useState(null);
  const [proofFile, setProofFile] = useState(null);

  // Nếu người dùng gõ trực tiếp URL /checkout mà không đi từ nút "Mua ngay", đẩy về trang chủ
  if (!targetCourse) {
    return <Navigate to="/" replace />;
  }

  // BƯỚC 1: TẠO ĐƠN HÀNG (Gọi BE lấy mã QR)
  const handleCreateOrder = async () => {
    if (!user) {
      localStorage.setItem("redirect-after-login", "/checkout");
      navigate("/login");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("auth-token");

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: targetCourse.courseId, // ID của khóa học từ router state
        }),
      });

      const json = await res.json();
      if (json.success) {
        setOrderData(json.data); // Lưu orderData (chứa qrImageUrl, paymentCode, id...)
      } else {
        alert(json.error?.message || "Tạo đơn hàng thất bại");
      }
    } catch (err) {
      console.error("LỖI TẠO ĐƠN:", err);
      alert("Đã xảy ra lỗi khi tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: UPLOAD MINH CHỨNG THANH TOÁN
  const handleSubmitProof = async () => {
    if (!proofFile) return alert("Vui lòng chọn ảnh minh chứng thanh toán!");

    setLoading(true);
    const token = localStorage.getItem("auth-token");

    // Vì là file upload, dùng FormData thay vì JSON
    const formData = new FormData();
    formData.append("proofFile", proofFile);

    try {
      // Gọi API gửi minh chứng chuẩn theo Contract V8
      const res = await fetch(`${API}/orders/${orderData.id}/proof`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Không set Content-Type, trình duyệt sẽ tự sinh boundary cho multipart/form-data
        },
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        alert(
          "Gửi minh chứng thành công! Vui lòng chờ admin duyệt và gửi mã qua email.",
        );
        navigate("/my-courses");
      } else {
        alert(json.error?.message || "Gửi minh chứng thất bại");
      }
    } catch (err) {
      console.error("LỖI UPLOAD PROOF:", err);
      alert("Đã xảy ra lỗi khi tải ảnh lên.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-left">
        <h1 className="checkout-title">Thanh toán khóa học</h1>
        <div className="checkout-course">
          <img
            src={targetCourse.thumbnailUrl}
            alt={targetCourse.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.target.src =
                "https://placehold.co/400x225/4f46e5/white?text=No+Image";
            }}
          />
          <div className="checkout-course-info">
            <div className="checkout-course-title">{targetCourse.title}</div>
            <div className="checkout-course-price">
              {Number(targetCourse.price || 0).toLocaleString()}đ
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-right">
        {/* NẾU CHƯA CÓ ORDER -> HIỂN THỊ NÚT TẠO ĐƠN */}
        {!orderData ? (
          <>
            <h2 className="summary-title">Tiến hành mua</h2>
            <button
              className="confirm-payment-btn"
              onClick={handleCreateOrder}
              disabled={loading}
            >
              {loading ? "Đang tạo đơn..." : "Tạo đơn hàng & Lấy mã QR"}
            </button>
          </>
        ) : (
          /* NẾU ĐÃ CÓ ORDER -> HIỂN THỊ QR TỪ BACKEND VÀ FORM UPLOAD PROOF */
          <div className="qr-box">
            <h3>Quét mã QR để thanh toán</h3>
            {/* Sử dụng link QR do Backend trả về */}
            <img
              src={orderData.qrImageUrl}
              alt="QR Payment"
              className="payment-qr"
            />

            <div className="bank-info">
              <p>
                <strong>Mã đơn hàng:</strong> {orderData.id}
              </p>
              <p>
                <strong>Số tiền:</strong>{" "}
                {Number(orderData.amount).toLocaleString()}đ
              </p>
              <p style={{ color: "red", fontWeight: "bold" }}>
                <strong>Nội dung chuyển khoản (Bắt buộc):</strong>{" "}
                {orderData.paymentCode}
              </p>
            </div>

            <div className="proof-upload-section" style={{ marginTop: "20px" }}>
              <h4>Tải lên minh chứng thanh toán</h4>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={(e) => setProofFile(e.target.files[0])}
              />
              <button
                className="confirm-payment-btn"
                style={{ marginTop: "10px" }}
                onClick={handleSubmitProof}
                disabled={loading || !proofFile}
              >
                {loading ? "Đang tải lên..." : "Xác nhận đã chuyển khoản"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
