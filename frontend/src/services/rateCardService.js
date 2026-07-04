import api from "./api";

export const getRateCards = async () => {
  const res = await api.get("/rate-cards");
  return res.data;
};

export const createRateCard = async (payload) => {
  const res = await api.post("/rate-cards", payload);
  return res.data;
};

export const updateRateCard = async (id, payload) => {
  const res = await api.put(`/rate-cards/${id}`, payload);
  return res.data;
};

export const deleteRateCard = async (id) => {
  const res = await api.delete(`/rate-cards/${id}`);
  return res.data;
};

export const getCodConfigs = async () => {
  const res = await api.get("/cod-config");
  return res.data;
};

export const setCodConfig = async (payload) => {
  const res = await api.post("/cod-config", payload);
  return res.data;
};
