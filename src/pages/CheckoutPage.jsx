import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import "./CSS/CheckoutPage.css";
import { useAuth } from "../Features/auth/context/AuthContext";
import { notifyError, notifySuccess } from "../utils/notify";
import apiFetch from "../utils/apiFetch";

const rawApiUrl = import.meta.env.VITE_API_URL;
const API = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`
  : "http://localhost:1201/api/v1";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state: targetCourse } = useLocation();

  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!orderData?.id || orderData.status === "PAID") return undefined;

    const timer = setInterval(async () => {
      try {
        const res = await apiFetch(`${API}/orders`);
        const json = await res.json();
        const latest = (json.data || []).find((order) => order.id === orderData.id);
        if (latest) {
          setOrderData(latest);
          if (latest.status === "PAID") {
            notifySuccess("Thanh toán đã được xác nhận tự động.");
            navigate("/my-courses");
          }
        }
      } catch (err) {
        console.error("LOG [PaymentPoll]:", err);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [navigate, orderData?.id, orderData?.status]);

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
    try {
      const res = await apiFetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: targetCourse.courseId }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setOrderData(json.data);
      } else {
        notifyError(json.error?.message || "Tạo đơn hàng thất bại");
      }
    } catch (err) {
      notifyError(err.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPaid = async () => {
    if (!orderData?.paymentCode) return;
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/payments/simulate-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentCode: orderData.paymentCode }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Xác nhận thanh toán thất bại");
      }
      notifySuccess("Đã giả lập thanh toán. Hệ thống đã gửi mail kích hoạt.");
      navigate("/invoices");
    } catch (err) {
      notifyError(err.message || "Không thể xác nhận thanh toán.");
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
              <h4>Thanh toán giả lập</h4>
              <p>Vui lòng chuyển khoản đúng nội dung: {orderData.paymentCode}</p>
              <button className="confirm-payment-btn" onClick={handleConfirmPaid} disabled={loading}>
                {loading ? "Đang xác nhận..." : "Tôi đã thanh toán"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
