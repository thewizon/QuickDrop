import api from "./api";

export const getAdminDashboard = async () => (await api.get("/dashboard/admin")).data;
export const getAgentDashboard = async () => (await api.get("/dashboard/agent")).data;
export const getCustomerDashboard = async () => (await api.get("/dashboard/customer")).data;
