import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart, getCartItems, removeCartItem } from "../utils/cart";
import { notifyError, notifySuccess } from "../utils/notify";
import apiFetch from "../utils/apiFetch";

const rawApiUrl = import.meta.env.VITE_API_URL;
const API = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`
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
        throw new Error(json.error?.message || json.message || "Xac nhan thanh toan that bai");
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
      const uniqueItems = items.map((item) => ({ courseId: item.id, quantity: 1 }));

      const res = await apiFetch(`${API}/orders/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: uniqueItems }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || "Tao don hang that bai");
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
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 24 }}>
      <h1>Gio hang</h1>

      {!items.length && !checkout && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          <p style={{ fontSize: 18 }}>Gio hang dang trong.</p>
          <button onClick={() => navigate("/")} style={{ marginTop: 16, padding: "10px 24px", cursor: "pointer" }}>
            Kham pha khoa hoc
          </button>
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          style={{ display: "flex", gap: 16, borderBottom: "1px solid #eee", padding: "16px 0", alignItems: "center" }}
        >
          <img
            src={item.thumbnailUrl || "https://placehold.co/120x80/4f46e5/white?text=Course"}
            alt={item.title}
            style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 15 }}>{item.title}</b>
            <div style={{ color: "#e74c3c", fontWeight: 600, marginTop: 4 }}>
              {Number(item.price || 0).toLocaleString()}đ
            </div>
          </div>
          <button
            onClick={() => remove(item.id)}
            style={{ background: "none", border: "1px solid #ddd", padding: "5px 10px", cursor: "pointer", borderRadius: 4, color: "#dc2626", fontSize: 12 }}
          >
            Xoa
          </button>
        </div>
      ))}

      {!!items.length && (
        <div
          style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderTop: "2px solid #eee" }}
        >
          <div>
            <b style={{ fontSize: 16 }}>Tong tien: {total.toLocaleString()}đ</b>
            <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
              {items.length} khoa hoc
            </div>
          </div>
          <button
            disabled={loading}
            onClick={checkoutCart}
            style={{ padding: "12px 28px", background: loading ? "#d1d5db" : "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600 }}
          >
            {loading ? "Dang tao don..." : "Thanh toan gio hang"}
          </button>
        </div>
      )}

      {checkout && (
        <div style={{ marginTop: 32, padding: 24, border: "1px solid #ddd", borderRadius: 12, background: "#fafafa" }}>
          <h2 style={{ marginTop: 0 }}>Quet QR de thanh toan</h2>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <img
              src={checkout.qrImageUrl}
              alt="VietQR"
              style={{ maxWidth: 280, width: "100%", borderRadius: 8, border: "1px solid #eee" }}
            />
            <div style={{ flex: 1, minWidth: 220 }}>
              <p>
                <b>Tong tien:</b>{" "}
                <span style={{ color: "#e74c3c", fontWeight: 700, fontSize: 18 }}>
                  {Number(checkout.amount || 0).toLocaleString()}đ
                </span>
              </p>
              <p>
                <b>Noi dung CK:</b>{" "}
                <code style={{ background: "#f0f4ff", padding: "4px 8px", borderRadius: 4, fontSize: 15, color: "#2563eb", fontWeight: 700 }}>
                  {checkout.paymentCode}
                </code>
              </p>
              {checkout.orders?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <b>Cac khoa hoc ({checkout.orders.length}):</b>
                  <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                    {checkout.orders.map((order) => (
                      <li key={order.id} style={{ marginBottom: 4, fontSize: 13 }}>
                        {order.courseTitle} —{" "}
                        <span style={{ color: "#e74c3c" }}>{Number(order.amount || 0).toLocaleString()}đ</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div
                style={{ marginTop: 12, padding: 12, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, fontSize: 13, color: "#92400e" }}
              >
                Day la thanh toan gia lap. Bam nut ben duoi sau khi da chuyen khoan de he thong gui mail kich hoat.
              </div>
              <button
                disabled={loading}
                onClick={confirmPaid}
                style={{ marginTop: 16, padding: "12px 0", background: loading ? "#d1d5db" : "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600, width: "100%" }}
              >
                {loading ? "Dang xac nhan..." : "Toi da thanh toan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
