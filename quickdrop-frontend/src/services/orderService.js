import api from "./api";

export const previewCharge = async (payload) => {
  const res = await api.post("/orders/preview-charge", payload);
  return res.data;
};

export const createOrder = async (payload) => {
  const res = await api.post("/orders", payload);
  return res.data;
};

export const getMyOrders = async () => {
  const res = await api.get("/orders/my-orders");
  return res.data;
};

export const getAllOrders = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await api.get(`/orders${params ? `?${params}` : ""}`);
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const getOrderTracking = async (id) => {
  const res = await api.get(`/orders/${id}/tracking`);
  return res.data;
};

export const assignAgent = async (id, agentId) => {
  const res = await api.patch(`/orders/${id}/assign-agent`, { agentId });
  return res.data;
};

export const autoAssign = async (id) => {
  const res = await api.patch(`/orders/${id}/auto-assign`);
  return res.data;
};

export const updateOrderStatus = async (id, orderStatus, failureReason) => {
  const res = await api.patch(`/orders/${id}/status`, { orderStatus, failureReason });
  return res.data;
};

export const rescheduleOrder = async (id, rescheduledDate) => {
  const res = await api.patch(`/orders/${id}/reschedule`, { rescheduledDate });
  return res.data;
};
