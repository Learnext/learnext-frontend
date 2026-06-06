import { useEffect, useState } from "react";
import "../pages/CSS/InvoicesPage.css";

const API = "http://localhost:1201/api/v1";

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    fetch(`${API}/invoices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => setInvoices(json.data || []))
      .catch(() => setInvoices([]));
  }, []);

  return (
    <div className="invoices-page">
      <h1 className="invoices-title">Hóa đơn của tôi</h1>
      {invoices.length === 0 ? (
        <div className="invoices-empty">
          <div className="empty-icon">🧾</div>
          <p>Chưa có hóa đơn.</p>
        </div>
      ) : (
        <div className="invoices-list">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-left">
                <span className="invoice-no">{invoice.invoiceNo}</span>
                <span className="invoice-course">{invoice.courseTitle}</span>
                <span className="invoice-date">
                  Ngày xuất:{" "}
                  {new Date(invoice.issuedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="invoice-right">
                <span className="invoice-amount">
                  {Number(invoice.amount || 0).toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
