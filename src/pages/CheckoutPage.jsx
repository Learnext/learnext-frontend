import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import "./CSS/CheckoutPage.css";
import { useAuth } from "../Features/auth/context/AuthContext";

const API = "http://localhost:1201/api/v1";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state: targetCourse } = useLocation();

  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [proofFile, setProofFile] = useState(null);

  if (!targetCourse) {
    return <Navigate to="/" replace />;
  }

  // BƯỚC 1: TẠO ĐƠN HÀNG
  const handleCreateOrder = async () => {
    if (!user) {
      localStorage.setItem("redirect-after-login", "/checkout");
      navigate("/login");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("auth-token");
    console.log(
      "LOG [CreateOrder]: Đang gửi request tạo đơn với Token:",
      token ? "OK" : "MISSING",
    );

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: targetCourse.courseId }),
      });

      console.log("LOG [CreateOrder]: Status Code:", res.status);

      if (res.status === 401) {
        console.warn("LOG [CreateOrder]: Lỗi 401 - Token không hợp lệ!");
        alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }

      const json = await res.json();
      console.log("LOG [CreateOrder]: Response JSON:", json);

      if (res.ok && json.success) {
        setOrderData(json.data);
      } else {
        alert(json.error?.message || "Tạo đơn hàng thất bại");
      }
    } catch (err) {
      console.error("LOG [CreateOrder]: Lỗi Catch:", err);
      alert("Đã xảy ra lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: UPLOAD MINH CHỨNG
  const handleSubmitProof = async () => {
    if (!proofFile) return alert("Vui lòng chọn file minh chứng!");
    if (!orderData || !orderData.id) {
      console.error("LOG [Upload]: OrderData bị null hoặc thiếu ID");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("auth-token");
    const formData = new FormData();
    formData.append("proofFile", proofFile);

    console.log(
      "LOG [Upload]: Đang gửi ảnh tới URL:",
      `${API}/orders/${orderData.id}/proof`,
    );

    try {
      const res = await fetch(`${API}/orders/${orderData.id}/proof`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("LOG [Upload]: Status Code:", res.status);

      // Bắt lỗi 500 trước khi parse JSON
      if (res.status === 500) {
        console.error(
          "LOG [Upload]: Server trả về lỗi 500. Kiểm tra Terminal Backend!",
        );
      }

      const json = await res.json();
      console.log("LOG [Upload]: Response JSON:", json);

      if (res.ok && json.success) {
        alert("Gửi minh chứng thành công!");
        navigate("/my-courses");
      } else {
        alert(json.error?.message || "Gửi minh chứng thất bại");
      }
    } catch (err) {
      console.error("LOG [Upload]: Lỗi Catch:", err);
      alert("Lỗi upload ảnh.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      {/* (UI giữ nguyên như cũ) */}
      <div className="checkout-left">
        <h1 className="checkout-title">Thanh toán khóa học</h1>
        <div className="checkout-course">
          <img src={targetCourse.thumbnailUrl} alt={targetCourse.title} />
          <div className="checkout-course-info">
            <div className="checkout-course-title">{targetCourse.title}</div>
            <div className="checkout-course-price">
              {Number(targetCourse.price || 0).toLocaleString()}đ
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-right">
        {!orderData ? (
          <button
            className="confirm-payment-btn"
            onClick={handleCreateOrder}
            disabled={loading}
          >
            {loading ? "Đang tạo đơn..." : "Tạo đơn hàng & Lấy mã QR"}
          </button>
        ) : (
          <div className="qr-box">
            <h3>Quét mã QR để thanh toán</h3>
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
              <p style={{ color: "red" }}>
                <strong>Nội dung:</strong> {orderData.paymentCode}
              </p>
            </div>

            <div className="proof-upload-section">
              <h4>Tải minh chứng thanh toán</h4>
              <input
                type="file"
                onChange={(e) => setProofFile(e.target.files[0])}
              />
              <button
                className="confirm-payment-btn"
                onClick={handleSubmitProof}
                disabled={loading || !proofFile}
              >
                Xác nhận đã chuyển khoản
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
