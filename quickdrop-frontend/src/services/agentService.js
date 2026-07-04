import api from "./api";

export const getAgents = async () => {
  const res = await api.get("/agents");
  return res.data;
};

export const createAgent = async (payload) => {
  const res = await api.post("/agents", payload);
  return res.data;
};

export const updateAgentZone = async (id, zone) => {
  const res = await api.patch(`/agents/${id}/zone`, { zone });
  return res.data;
};

export const updateMyAgentStatus = async (payload) => {
  const res = await api.patch("/agents/me/status", payload);
  return res.data;
};
