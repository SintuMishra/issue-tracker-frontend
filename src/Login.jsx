import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreateTicket from "./CreateTicket.jsx";
// 🚨 IMPORT: Use your apiFetch utility
import { apiFetch } from "./api"; 

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("LOGIN CLICKED");
    setError("");
    setUser(null);

    try {
      // 🚨 UPDATED: Use apiFetch instead of hardcoded fetch
      // apiFetch automatically prepends the Render URL (VITE_API_BASE_URL)
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      console.log("LOGIN SUCCESS", data);

      // Save user to localStorage (includes token and role)
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      // Redirect based on role
      if (data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      console.error("LOGIN ERROR", err);
      setError(err.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Issue Tracker - Login</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block" }}>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block" }}>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Login
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        No account? <Link to="/register">Register here</Link>
      </p>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {user && (
        <div style={{ marginTop: 20 }}>
          <h3>Logged in as: {user.email}</h3>
          <div style={{ marginTop: 30 }}>
            <CreateTicket user={user} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;