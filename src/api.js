// src/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiFetch = async (endpoint, options = {}) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  // 🚨 FIX: Handle multiple possible token property names
  const token = user ? (user.token || user.accessToken || user.jwt) : null;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  console.log(`[API] Requesting: ${BASE_URL}${endpoint}`);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.status === 401 || response.status === 403) {
      console.error(`[API] Auth Error: ${response.status}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "API Error");
    }

    // 🚨 FIX: Return the JSON directly to simplify component code
    return await response.json();
  } catch (error) {
    console.error("[API] Fetch failed:", error);
    throw error;
  }
};