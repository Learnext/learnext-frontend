import { requestApi } from "./accountApi";

const adminHeaders = (adminKey) => ({
  "X-Admin-Key": adminKey,
});

export const fetchAdminOrders = async (adminKey) =>
  requestApi("/admin/orders", {
    headers: adminHeaders(adminKey),
  });

export const confirmAdminOrder = async (adminKey, orderId) =>
  requestApi(`/admin/orders/${orderId}/confirm`, {
    method: "PATCH",
    headers: adminHeaders(adminKey),
  });

export const rejectAdminOrder = async (adminKey, orderId) =>
  requestApi(`/admin/orders/${orderId}/reject`, {
    method: "PATCH",
    headers: adminHeaders(adminKey),
  });

export const fetchSupportLeads = async (adminKey) =>
  requestApi("/admin/support/leads", {
    headers: adminHeaders(adminKey),
  });
