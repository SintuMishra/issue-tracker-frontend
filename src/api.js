// Use the production URL if the environment variable is set.
// Otherwise, default to your local development URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiFetch = async (endpoint, options = {}) => {
  // 1. Get User from Storage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const token = user ? user.token : null;

  // 👇 DEBUG LOGS
  console.log(`[API] Fetching ${BASE_URL}${endpoint}`);
  if (token) {
    console.log("[API] Attaching Token:", token.substring(0, 10) + "...");
  } else {
    // This is expected for /api/auth/register and /api/auth/login
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

  // 🚨 FIXED: Use the dynamic BASE_URL here
  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 4. Handle Errors
  if (response.status === 401 || response.status === 403) {
    console.error(`[API] Access Denied (${response.status}). Your token might be invalid or role mismatch.`);
    // Optionally: force logout if token is expired (401)
    // if (response.status === 401) {
    //   localStorage.removeItem("user");
    //   window.location.href = "/login";
    // }
  }

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "API Error");
  }

  return response;
};