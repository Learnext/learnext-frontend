import React, { useEffect, useState } from "react";
import { useInstructorGuard } from "../hooks/useInstructorGuard";
import { fetchInstructorSalesService } from "../services/instructorService";
import "../styles/InstructorDashboard.css";

const statusLabel = {
  PENDING_PAYMENT: { label: "Cho TT", color: "#854d0e",  bg: "#fef9c3" },
  PROOF_SUBMITTED: { label: "Da nop bien lai", color: "#1d4ed8", bg: "#dbeafe" },
  PAID:            { label: "Da TT",  color: "#166534",  bg: "#dcfce7" },
  REJECTED:        { label: "Tu choi", color: "#991b1b", bg: "#fee2e2" },
};

const Badge = ({ status }) => {
  const s = statusLabel[status] || { label: status, color: "#374151", bg: "#f3f4f6" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  );
};

const InstructorSales = () => {
  const { isAllowed } = useInstructorGuard();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchInstructorSalesService();
        setData(result);
      } catch (err) {
        setError(err.message || "Khong tai duoc du lieu doanh thu");
      } finally {
        setLoading(false);
      }
    };
    if (isAllowed) load();
  }, [isAllowed]);

  if (!isAllowed) return null;

  if (loading) return <div className="instructor-dashboard"><div className="loading">Dang tai...</div></div>;
  if (error)   return <div className="instructor-dashboard"><p style={{ color: "#dc2626" }}>{error}</p></div>;

  const orders = data?.orders || [];
  const paidOrders = orders.filter((o) => o.status === "PAID");

  return (
    <div className="instructor-dashboard">
      <h1>Doanh thu &amp; Hoc vien</h1>

      {/* Stats */}
      <div className="dashboard-cards" style={{ marginBottom: 28 }}>
        <div className="dashboard-card">
          <h3>Tong hoc vien</h3>
          <p>{data?.totalStudents ?? 0}</p>
        </div>
        <div className="dashboard-card">
          <h3>Doanh thu</h3>
          <p>{Number(data?.totalRevenue ?? 0).toLocaleString("vi-VN")}đ</p>
        </div>
        <div className="dashboard-card">
          <h3>Don hang (PAID)</h3>
          <p>{paidOrders.length}</p>
        </div>
        <div className="dashboard-card">
          <h3>Tong don hang</h3>
          <p>{orders.length}</p>
        </div>
      </div>

      {/* Order list */}
      <h2>Lich su don hang</h2>
      {orders.length === 0 && <p style={{ color: "#888" }}>Chua co don hang nao.</p>}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              <th style={{ padding: "10px 12px" }}>Khoa hoc</th>
              <th style={{ padding: "10px 12px" }}>Ma CK</th>
              <th style={{ padding: "10px 12px", textAlign: "right" }}>So tien</th>
              <th style={{ padding: "10px 12px" }}>Trang thai</th>
              <th style={{ padding: "10px 12px" }}>Ngay tao</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px 12px", fontWeight: 500 }}>{order.courseTitle}</td>
                <td style={{ padding: "10px 12px" }}>
                  <code style={{ background: "#f0f4ff", padding: "1px 6px", borderRadius: 3 }}>{order.paymentCode}</code>
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: "#e74c3c", fontWeight: 600 }}>
                  {Number(order.amount || 0).toLocaleString()}đ
                </td>
                <td style={{ padding: "10px 12px" }}><Badge status={order.status} /></td>
                <td style={{ padding: "10px 12px", color: "#9ca3af" }}>
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorSales;
