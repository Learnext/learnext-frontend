import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchOrders, submitPaymentProof } from "../services/orderAccountService";
import "../styles/AccountPages.css";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [proofs, setProofs] = useState({});
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchOrders()
      .then((data) => {
        setOrders(data || []);
        setStatus("");
      })
      .catch((error) => setStatus(error.message));
  }, [navigate, user]);

  const handleSubmitProof = async (orderId) => {
    setStatus("Submitting proof...");
    try {
      const updated = await submitPaymentProof(orderId, proofs[orderId]);
      setOrders((items) => items.map((item) => (item.id === orderId ? updated : item)));
      setProofs((value) => ({ ...value, [orderId]: "" }));
      setStatus("");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="account-page">
      <section className="account-panel">
        <h1>My orders</h1>
        {status && <p className="account-status">{status}</p>}
        <div className="account-list">
          {orders.map((order) => (
            <article key={order.id} className="account-row">
              <div>
                <strong>{order.courseTitle}</strong>
                <span>{order.status}</span>
                <p>${Number(order.amount || 0).toFixed(2)}</p>
                {order.paymentProofUrl && <a href={order.paymentProofUrl}>Payment proof</a>}
              </div>
              {(order.status === "PENDING_PAYMENT" || order.status === "REJECTED") && (
                <div className="account-inline-form">
                  <input
                    value={proofs[order.id] || ""}
                    onChange={(event) => setProofs((value) => ({ ...value, [order.id]: event.target.value }))}
                    placeholder="Payment proof URL"
                  />
                  <button onClick={() => handleSubmitProof(order.id)}>Submit proof</button>
                </div>
              )}
            </article>
          ))}
          {!status && orders.length === 0 && <p>No orders yet.</p>}
        </div>
      </section>
    </main>
  );
};

export default Orders;
