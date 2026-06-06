import { useEffect, useState } from "react";

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
    <div style={{ maxWidth: 900, margin: "32px auto", padding: 24 }}>
      <h1>Hóa đơn của tôi</h1>
      {invoices.length === 0 ? (
        <p>Chưa có hóa đơn.</p>
      ) : (
        invoices.map((invoice) => (
          <div key={invoice.id} style={{ border: "1px solid #ddd", padding: 16, margin: "12px 0" }}>
            <b>{invoice.invoiceNo}</b>
            <p>{invoice.courseTitle}</p>
            <p>Số tiền: {Number(invoice.amount || 0).toLocaleString()}đ</p>
            <p>Ngày xuất: {new Date(invoice.issuedAt).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default InvoicesPage;
