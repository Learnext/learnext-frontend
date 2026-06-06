import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart, getCartItems, removeCartItem } from "../utils/cart";
import { notifyError, notifySuccess } from "../utils/notify";
import apiFetch from "../utils/apiFetch";
import "./CSS/CartPage.css";

const rawApiUrl = import.meta.env.VITE_API_URL;
const API = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1")
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : "http://localhost:1201/api/v1";

const CartPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(getCartItems());
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const remove = (courseId) => setItems(removeCartItem(courseId));

  const confirmPaid = async () => {
    if (!checkout?.paymentCode) return;
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/payments/simulate-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentCode: checkout.paymentCode }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message || json.message || "Xac nhan thanh toan that bai",
        );
      }
      notifySuccess("Da gia lap thanh toan. He thong se gui mail kich hoat.");
      navigate("/invoices");
    } catch (err) {
      notifyError(err.message || "Khong the xac nhan thanh toan.");
    } finally {
      setLoading(false);
    }
  };

  const checkoutCart = async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      localStorage.setItem("redirect-after-login", "/cart");
      navigate("/login");
      return;
    }
    if (!items.length) return;
    setLoading(true);
    try {
      const uniqueItems = items.map((item) => ({
        courseId: item.id,
        quantity: 1,
      }));
      const res = await apiFetch(`${API}/orders/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: uniqueItems }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message || json.message || "Tao don hang that bai",
        );
      }
      setCheckout(json.data);
      clearCart();
      notifySuccess("Da tao don hang.");
    } catch (err) {
      notifyError(err.message || "Khong the thanh toan gio hang.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">Giỏ hàng</h1>

      {!items.length && !checkout && (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <p>Giỏ hàng đang trống.</p>
          <button onClick={() => navigate("/")}>Khám phá khóa học</button>
        </div>
      )}

      {!!items.length && (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={
                    item.thumbnailUrl ||
                    "https://placehold.co/120x80/4f46e5/white?text=Course"
                  }
                  alt={item.title}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <b className="cart-item-title">{item.title}</b>
                  <div className="cart-item-price">
                    {Number(item.price || 0).toLocaleString("vi-VN")}đ
                  </div>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => remove(item.id)}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">
                Tổng tiền ({items.length} khóa học)
              </span>
              <span className="cart-total-amount">
                {total.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <button
              className={`cart-checkout-btn ${loading ? "loading" : ""}`}
              disabled={loading}
              onClick={checkoutCart}
            >
              {loading ? "Đang tạo đơn..." : "Thanh toán giỏ hàng"}
            </button>
          </div>
        </>
      )}

      {checkout && (
        <div className="cart-qr-box">
          <h2>Quét QR để thanh toán</h2>
          <div className="cart-qr-content">
            <img
              src={checkout.qrImageUrl}
              alt="VietQR"
              className="cart-qr-img"
            />
            <div className="cart-qr-info">
              <p className="cart-qr-amount">
                <b>Tổng tiền:</b>{" "}
                <span>
                  {Number(checkout.amount || 0).toLocaleString("vi-VN")}đ
                </span>
              </p>
              <p className="cart-qr-code">
                <b>Nội dung CK:</b> <code>{checkout.paymentCode}</code>
              </p>

              {checkout.orders?.length > 0 && (
                <div className="cart-qr-orders">
                  <b>Các khóa học ({checkout.orders.length}):</b>
                  <ul>
                    {checkout.orders.map((order) => (
                      <li key={order.id}>
                        {order.courseTitle} —{" "}
                        <span>
                          {Number(order.amount || 0).toLocaleString("vi-VN")}đ
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="cart-qr-notice">
                Đây là thanh toán giả lập. Bấm nút bên dưới sau khi đã chuyển
                khoản để hệ thống gửi mail kích hoạt.
              </div>

              <button
                className={`cart-confirm-btn ${loading ? "loading" : ""}`}
                disabled={loading}
                onClick={confirmPaid}
              >
                {loading ? "Đang xác nhận..." : "Tôi đã thanh toán"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
