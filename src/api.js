// Ensure VITE_API_BASE_URL is set in Vercel to: https://issue-tracker-backend-gcoi.onrender.com
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiFetch = async (endpoint, options = {}) => {
  // 1. Get User from Storage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  // 🚨 IMPROVED: Check for different common token property names
  const token = user ? (user.token || user.accessToken || user.jwt) : null;

  // 👇 DEBUG LOGS
  console.log(`[API] Target URL: ${BASE_URL}${endpoint}`);
  if (token) {
    console.log("[API] Attaching Token: Bearer " + token.substring(0, 10) + "...");
  } else {
    console.warn("[API] NO TOKEN FOUND! Request will be anonymous.");
  }

  // 2. Prepare Headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 3. Send Request
  const config = {
    ...options,
    headers,
  };

  // Execute Fetch
  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 4. Handle Errors
  if (response.status === 401 || response.status === 403) {
    console.error(`[API] Security Error (${response.status}): Check role or token validity.`);
  }

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "API Error");
  }

  // 🚨 UPDATED: Automatically parse JSON for successful requests
  return response.json();
};