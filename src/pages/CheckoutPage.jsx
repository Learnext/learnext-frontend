import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/CheckoutPage.css";
import { useAuth } from "../Features/auth/context/AuthContext";
import {
  fetchCartService,
  clearCartService,
} from "../Features/cart/services/cartService";

const API = "http://localhost:5000";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);

  const [paying, setPaying] = useState(false); // fix: tránh bấm nhiều lần

  // fix: dùng service thay vì đọc thẳng localStorage
  useEffect(() => {
    const load = async () => {
      const data = await fetchCartService();
      setCartItems(data);
    };
    load();
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0,
  );
  const [showQR, setShowQR] = useState(false);

  const transferContent =
    user && cartItems.length
      ? `COURSE_${cartItems[0].courseId}_USER_${user.id}`
      : "";

  const qrUrl =
    `https://img.vietqr.io/image/MB-123456789-compact2.png` +
    `?amount=${total}` +
    `&addInfo=${transferContent}` +
    `&accountName=NGUYEN%20VAN%20A`;

  const handlePayment = async () => {
    console.log("=== BẮT ĐẦU THANH TOÁN ===");
    console.log("User:", user);
    console.log("Cart items:", cartItems);

    if (!user) {
      console.log("Chưa đăng nhập → redirect login");
      localStorage.setItem("redirect-after-login", "/checkout");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      console.log("Giỏ hàng trống");
      alert("Giỏ hàng đang trống");
      return;
    }

    if (paying) {
      console.log("Đang xử lý, bỏ qua");
      return;
    }
    setPaying(true);

    try {
      const existingRes = await fetch(`${API}/orders?userId=${user.id}`);
      const existingOrders = await existingRes.json();
      console.log("Orders hiện tại:", existingOrders);

      for (const item of cartItems) {
        const alreadyBought = existingOrders.some(
          (o) => String(o.courseId) === String(item.courseId),
        );
        console.log(`Course ${item.courseId} - đã mua:`, alreadyBought);

        if (!alreadyBought) {
          const res = await fetch(`${API}/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: String(user.id),
              courseId: String(item.courseId),
              createdAt: new Date().toISOString(),
              paymentMethod: "cod",
              status: "paid",
            }),
          });

          await res.json();

          // tăng học viên
          const courseRes = await fetch(`${API}/courses/${item.courseId}`);

          const course = await courseRes.json();

          await fetch(`${API}/courses/${item.courseId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              students: (course.students || 0) + 1,
            }),
          });
        }
      }

      clearCartService();
      setCartItems([]);
      console.log("=== THANH TOÁN XONG ===");
      alert("Thanh toán thành công!");
      navigate("/my-courses");
    } catch (err) {
      console.error("LỖI THANH TOÁN:", err);
      alert("Thanh toán thất bại, vui lòng thử lại");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-left">
        <h1 className="checkout-title">Thanh toán</h1>

        {cartItems.length === 0 ? (
          <p>Không có khóa học trong giỏ hàng</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="checkout-course">
              <img src={item.thumbnail} alt={item.title} />

              <div className="checkout-course-info">
                <div className="checkout-course-title">{item.title}</div>

                <div className="checkout-course-price">
                  {Number(item.price || 0).toLocaleString()}đ
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="checkout-right">
        <h2 className="summary-title">Tóm tắt đơn hàng</h2>

        <div className="summary-row">
          <span>Số khóa học</span>
          <span>{cartItems.length}</span>
        </div>

        <div className="summary-total">
          <span>Tổng cộng</span>
          <span>{total.toLocaleString()}đ</span>
        </div>

        <div className="payment-title">Phương thức thanh toán</div>

        <div className="payment-list">Chuyển khoản ngân hàng (QR)</div>

        <button className="confirm-payment-btn" onClick={() => setShowQR(true)}>
          Thanh toán bằng QR
        </button>
      </div>

      {showQR && (
        <div className="qr-modal">
          <div className="qr-box">
            <h3>Quét mã QR để thanh toán</h3>

            <img src={qrUrl} alt="QR Payment" className="payment-qr" />

            <div className="bank-info">
              <p>
                <strong>Ngân hàng:</strong> MB Bank
              </p>

              <p>
                <strong>STK:</strong> 0929600037
              </p>

              <p>
                <strong>Chủ TK:</strong> NGUYEN KHANH NGUYEN
              </p>

              <p>
                <strong>Số tiền:</strong> {total.toLocaleString()}đ
              </p>

              <p>
                <strong>Nội dung:</strong> {transferContent}
              </p>
            </div>

            <button
              className="confirm-payment-btn"
              onClick={handlePayment}
              disabled={paying}
            >
              {paying ? "Đang xử lý..." : "Tôi đã chuyển khoản"}
            </button>

            <button className="cancel-btn" onClick={() => setShowQR(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
