import { requestApi, requireLogin } from "./accountApi";

export const fetchOrders = async () => {
  requireLogin();
  return requestApi("/orders");
};

export const submitPaymentProof = async (orderId, paymentProofUrl) => {
  requireLogin();
  return requestApi(`/orders/${orderId}/proof`, {
    method: "POST",
    body: JSON.stringify({ paymentProofUrl }),
  });
};
