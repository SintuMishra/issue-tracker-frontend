// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiFetch = (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`;
  return fetch(url, options);
};
