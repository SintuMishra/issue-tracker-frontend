import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

// --- IMPORTS ---
import AdminDashboard from "./AdminDashboard.jsx";
import StudentDashboard from "./StudentDashboard.jsx";
import { apiFetch } from "./api";

// --- 1. NEW PROFESSIONAL LANDING PAGE ---
function LandingPage() {
  return (
    <div className="landing-hero">
      <div className="landing-content">
        {/* Left Side: Text & Actions */}
        <div className="landing-left">
          <div className="logo-pill">
            <span className="logo-mark">TS</span>
            <span className="logo-text">Ticketing v2.0</span>
          </div>

          <h1>
            Resolve Campus
            <br />
            Issues Faster.
          </h1>
          <p>
            The smart way to manage hostel repairs and campus facilities.
            Real-time tracking for students, streamlined workflows for admins.
          </p>

          <div className="landing-buttons">
            <Link className="btn-hero-primary" to="/login">
              Report an Issue
            </Link>
            <Link className="btn-hero-secondary" to="/login">
              Student Login
            </Link>
          </div>

          {/* Subtle Admin Link (De-emphasized) */}
          <div style={{ marginTop: "-20px", marginBottom: "30px" }}>
            <Link className="admin-link" to="/login">
              Are you an Admin?
            </Link>
          </div>

          <div className="landing-highlights">
            <div className="highlight-item">
              <span className="highlight-icon">⚡</span>
              <span>Report issues in under 30 seconds</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🔔</span>
              <span>Get instant email notifications</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🛡️</span>
              <span>Official campus administration tool</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Card */}
        <div className="landing-right">
          <div className="mini-dashboard-card">
            <h3>Live Campus Status</h3>
            <ul>
              <li>
                <span>
                  <span className="dot open" /> Open Tickets
                </span>
                <span>12</span>
              </li>
              <li>
                <span>
                  <span className="dot progress" /> In Progress
                </span>
                <span>7</span>
              </li>
              <li>
                <span>
                  <span className="dot resolved" /> Resolved
                </span>
                <span>18</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 2. IMPROVED AUTH PAGE (With Security Code) ---
function UserAuthPage({ setUser }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("STUDENT");
  const [adminKey, setAdminKey] = useState("");
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
        // --- LOGIN LOGIC ---
        const user = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        // user is already parsed JSON from apiFetch
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        toast.success(`Welcome ${user.name || "back"}`);

        if (user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/student");
        }
      } else {
        // --- REGISTER LOGIC ---
        const registerData = { name, email, password, role };

        if (role === "ADMIN") {
          registerData.adminKey = adminKey;
        }

        // apiFetch throws Error on non-OK responses
        await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(registerData),
        });

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
          {isLogin ? "User Login" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="field">
                <label>Name</label>
                <input name="name" type="text" placeholder="Your name" required />
              </div>

              {/* Role Selection */}
              <div className="field">
                <label>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    width: "100%",
                  }}
                >
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* 🔒 SECURITY KEY FIELD (Only visible if Admin is selected) */}
              {role === "ADMIN" && (
                <div className="field" style={{ animation: "fadeUp 0.3s ease" }}>
                  <label style={{ color: "#dc2626", fontWeight: "bold" }}>
                    Security Code
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Secret Key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                    style={{ borderColor: "#dc2626", background: "#fef2f2" }}
                  />
                </div>
              )}
            </>
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
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 14 }}>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

// --- 3. MAIN APP ---
function App() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsMenuOpen(false);
    toast.success("Logged out");
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <div className="brand-icon">TS</div>
            <span className="brand-text">Ticketing System</span>
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>

            {user && user.role === "ADMIN" && <Link to="/admin">Admin</Link>}
            {user && user.role === "STUDENT" && (
              <Link to="/student">Dashboard</Link>
            )}

            {user ? (
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
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                </button>

                {isMenuOpen && (
                  <div
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
                      Signed in as{" "}
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
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-small">
                Login
              </Link>
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
              <AdminDashboard />
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
        }}
      />
    </BrowserRouter>
  );
}

export default App;
