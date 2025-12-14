import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreateTicket from "./CreateTicket.jsx";

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
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Login failed");
      }

      const data = await res.json();
      console.log("LOGIN SUCCESS", data);

      // save user so other pages (like /admin) can read role
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      // redirect based on role
      if (data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      console.error("LOGIN ERROR", err);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Issue Tracker - Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: 10 }}>
        No account? <Link to="/register">Register here</Link>
      </p>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {user && (
        <div style={{ marginTop: 20 }}>
          <h3>Logged in as:</h3>
          <pre>{JSON.stringify(user, null, 2)}</pre>

          <div style={{ marginTop: 30 }}>
            <h3>Create Ticket</h3>
            <CreateTicket user={user} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;