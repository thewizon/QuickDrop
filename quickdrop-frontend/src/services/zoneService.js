import api from "./api";

export const getZones = async () => {
  const res = await api.get("/zones");
  return res.data;
};

export const createZone = async (payload) => {
  const res = await api.post("/zones", payload);
  return res.data;
};

export const updateZone = async (id, payload) => {
  const res = await api.put(`/zones/${id}`, payload);
  return res.data;
};

export const deleteZone = async (id) => {
  const res = await api.delete(`/zones/${id}`);
  return res.data;
};
