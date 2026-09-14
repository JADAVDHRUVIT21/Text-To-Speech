import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (userData) => {
  const response = await api.post("/api/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/api/auth/login", userData);
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await api.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateProfile = async (profileData, token) => {
  const response = await api.put("/api/auth/me", profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updatePassword = async (passwordData, token) => {
  const response = await api.put("/api/auth/password", passwordData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getLanguages = async () => {
  const response = await api.get("/api/languages");
  return response.data;
};

export const getVoices = async () => {
  const response = await api.get("/api/voices");
  return response.data;
};

export const getHistory = async (token) => {
  const response = await api.get("/api/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createHistory = async (historyData, token) => {
  const response = await api.post("/api/history", historyData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateHistory = async (historyId, historyData, token) => {
  const response = await api.put(`/api/history/${historyId}`, historyData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteHistoryItem = async (historyId, token) => {
  const response = await api.delete(`/api/history/${historyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const clearHistory = async (token) => {
  const response = await api.delete("/api/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get("/api/health");
  return response.data;
};

export default api;