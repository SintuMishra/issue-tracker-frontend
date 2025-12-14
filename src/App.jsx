// src/App.jsx
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import AdminPage from "./AdminPage.jsx";
import StudentDashboard from "./StudentDashboard.jsx";
import { apiFetch } from "./api";

function LandingPage() {
  return (
    <div className="landing-hero">
      <div className="landing-overlay" />

      <div className="landing-content">
        <div className="landing-left">
          <div className="logo-pill">
            <span className="logo-mark">TS</span>
            <span className="logo-text">Ticketing System</span>
          </div>

          <h1>Smart Hostel & Campus Ticketing</h1>
          <p>
            Report hostel and campus issues in seconds, track progress in real time,
            and keep students, staff, and admins in sync.
          </p>

          <div className="landing-buttons">
            <Link className="btn primary" to="/login">
              User Login / Register
            </Link>
            <Link className="btn secondary" to="/login">
              Admin Login
            </Link>
            <Link className="btn tertiary" to="/admin">
              Go to Admin Dashboard
            </Link>
          </div>

          <div className="landing-highlights">
            <span>⚡  Fast issue reporting</span>
            <span>📊  Live ticket status</span>
            <span>🏨  Designed for hostels & halls</span>
          </div>
        </div>

        <div className="landing-right">
          <div className="mini-dashboard-card">
            <h3>Today’s Snapshot</h3>
            <ul>
              <li><span className="dot open" /> 12 Open tickets</li>
              <li><span className="dot progress" /> 7 In progress</li>
              <li><span className="dot resolved" /> 18 Resolved</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserAuthPage({ setUser }) {
  const [mode, setMode] = useState("login");
  const isLogin = mode === "login";
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const name = form.name?.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      if (isLogin) {
        const res = await apiFetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Login failed");
        }

        const user = await res.json(); // { id, name, email, role, ... }

        // save logged-in user
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);

        toast.success(`Welcome ${user.name || "back"}`);

        if (user.role === "ADMIN") {
          navigate("/admin");
        } else if (user.role === "STUDENT") {
          navigate("/student");
        } else {
          navigate("/");
        }
      } else {
        const res = await apiFetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            role: "STUDENT",
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Registration failed");
        }

        const created = await res.json();
        // you could use created.id if needed
        toast.success("Registration successful. Please log in.");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ display: "flex", marginBottom: 16 }}>
          <button
            type="button"
            className={`btn ${isLogin ? "primary" : "ghost"}`}
            style={{ flex: 1 }}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`btn ${!isLogin ? "primary" : "ghost"}`}
            style={{ flex: 1, marginLeft: 8 }}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <h2 style={{ marginTop: 0, marginBottom: 16 }}>
          {isLogin ? "User Login" : "User Registration"}
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="field">
              <label>Name</label>
              <input name="name" type="text" placeholder="Your name" required />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn primary"
            style={{ width: "100%", marginTop: 8 }}
          >
            {isLogin ? "Login" : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 14 }}>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  // load from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out");
    window.location.href = "/";
  };

  const toggleProfileMenu = () => {
    const menu = document.getElementById("profile-dropdown");
    if (menu) {
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    }
  };

  return (
    <BrowserRouter>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            Ticketing System
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/admin">Admin</Link>
            {user && (
              <div
                style={{ position: "relative", marginLeft: 12 }}
                className="profile-menu"
              >
                <button
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(229,231,235,0.4)",
                    background: "rgba(15,23,42,0.5)",
                    color: "#e5e7eb",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                  onClick={toggleProfileMenu}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "999px",
                      background: "#4b5563",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                    }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                  <span>{user.name || user.email}</span>
                  <span
                    style={{
                      fontSize: 11,
                      opacity: 0.8,
                      textTransform: "capitalize",
                    }}
                  >
                    {user.role?.toLowerCase()}
                  </span>
                </button>

                <div
                  id="profile-dropdown"
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 6,
                    minWidth: 180,
                    background: "#0f172a",
                    borderRadius: 8,
                    boxShadow:
                      "0 10px 25px rgba(15,23,42,0.5), 0 0 0 1px rgba(15,23,42,0.4)",
                    padding: 8,
                    display: "none",
                    zIndex: 40,
                  }}
                >
                  <div
                    style={{
                      padding: "6px 8px",
                      borderBottom: "1px solid rgba(31,41,55,0.8)",
                      marginBottom: 4,
                      fontSize: 13,
                      color: "#e5e7eb",
                    }}
                  >
                    Signed in as
                    <div style={{ fontWeight: 600 }}>{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "6px 8px",
                      border: "none",
                      background: "transparent",
                      color: "#fecaca",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserAuthPage setUser={setUser} />} />

        <Route
          path="/admin"
          element={
            user && user.role === "ADMIN" ? (
              <AdminPage />
            ) : (
              <UserAuthPage setUser={setUser} />
            )
          }
        />

        <Route
          path="/student"
          element={
            user && user.role === "STUDENT" ? (
              <StudentDashboard />
            ) : (
              <UserAuthPage setUser={setUser} />
            )
          }
        />
      </Routes>

      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          style: {
            borderRadius: "8px",
            background: "#111827",
            color: "#F9FAFB",
            fontSize: "14px",
          },
          success: {
            duration: 2500,
            style: {
              background: "#065f46",
            },
            iconTheme: {
              primary: "#6ee7b7",
              secondary: "#022c22",
            },
          },
          error: {
            duration: 3500,
            style: {
              background: "#7f1d1d",
            },
            iconTheme: {
              primary: "#fecaca",
              secondary: "#450a0a",
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
