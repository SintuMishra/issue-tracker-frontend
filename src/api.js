// src/api.js

/**
 * Vite Environment Variable Handling:
 * Local: Ensure .env.local has VITE_API_BASE_URL=http://localhost:8080
 * Vercel: Set VITE_API_BASE_URL=https://issue-tracker-backend-1-86vi.onrender.com
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiFetch = async (endpoint, options = {}) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Handle multiple possible token property names
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

  // CLEAN URL LOGIC: 
  // 1. Remove trailing slash from BASE_URL if it exists
  // 2. Ensure endpoint starts with a slash
  const cleanBase = BASE_URL.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${cleanBase}${cleanEndpoint}`;

  console.log(`[API] Requesting: ${fullUrl}`);

  // src/api.js logic fix
  // src/api.js
  try {
      const response = await fetch(fullUrl, config);

      // READ ONCE: Capture the response as text first
      const textData = await response.text();
      let data;
      try {
          data = JSON.parse(textData); // Try to parse as JSON
      } catch (e) {
          data = textData; // Keep as text if not JSON
      }

      if (!response.ok) {
          // Now use the already-read 'data'
          const message = data.message || (typeof data === 'string' ? data : "API Error");
          throw new Error(message);
      }

      return data;
  } catch (error) {
      console.error("[API] Fetch failed:", error.message);
      throw error;
  }
};