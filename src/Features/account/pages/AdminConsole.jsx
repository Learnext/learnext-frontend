import { useState } from "react";
import { confirmAdminOrder, fetchAdminOrders, fetchSupportLeads, rejectAdminOrder } from "../services/adminService";
import "../styles/AccountPages.css";

const AdminConsole = () => {
  const [adminKey, setAdminKey] = useState(localStorage.getItem("admin-key") || "");
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState("");

  const load = async () => {
    localStorage.setItem("admin-key", adminKey);
    setStatus("Loading admin data...");
    try {
      const [orderData, leadData] = await Promise.all([fetchAdminOrders(adminKey), fetchSupportLeads(adminKey)]);
      setOrders(orderData || []);
      setLeads(leadData || []);
      setStatus("");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const actOnOrder = async (orderId, action) => {
    setStatus("Updating order...");
    try {
      const result =
        action === "confirm" ? await confirmAdminOrder(adminKey, orderId) : await rejectAdminOrder(adminKey, orderId);
      const updatedOrder = result.order || result;
      setOrders((items) => items.map((item) => (item.id === orderId ? updatedOrder : item)));
      setStatus(result.activationCode ? `Activation code: ${result.activationCode}` : "");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="account-page">
      <section className="account-panel">
        <h1>Admin</h1>
        <div className="account-inline-form">
          <input value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="Admin key" />
          <button onClick={load}>Load</button>
        </div>
        {status && <p className="account-status">{status}</p>}
        <h2>Orders</h2>
        <div className="account-list">
          {orders.map((order) => (
            <article key={order.id} className="account-row">
              <div>
                <strong>{order.courseTitle}</strong>
                <span>{order.status}</span>
                {order.paymentProofUrl && <a href={order.paymentProofUrl}>Proof</a>}
              </div>
              {order.status === "PROOF_SUBMITTED" && (
                <div className="account-actions">
                  <button onClick={() => actOnOrder(order.id, "confirm")}>Confirm</button>
                  <button onClick={() => actOnOrder(order.id, "reject")}>Reject</button>
                </div>
              )}
            </article>
          ))}
        </div>
        <h2>Support leads</h2>
        <div className="account-list">
          {leads.map((lead) => (
            <article key={lead.id} className="account-row">
              <div>
                <strong>{lead.subject}</strong>
                <span>{lead.status}</span>
                <p>
                  {lead.name} · {lead.email}
                </p>
                <p>{lead.message}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AdminConsole;
