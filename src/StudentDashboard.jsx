// src/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "./api"; // ✅ FIX: Centralized API helper

// --- SKELETON LOADER COMPONENT (Visual placeholder while loading) ---
const TableSkeleton = () => (
  <div style={{ animation: "pulse 1.5s infinite" }}>
    {[1, 2, 3].map((i) => (
      <div key={i} style={{ display: "flex", padding: "20px", borderBottom: "1px solid #eee", gap: "15px" }}>
        <div style={{ width: "40px", height: "20px", background: "#e2e8f0", borderRadius: "4px" }}></div>
        <div style={{ flex: 1, height: "20px", background: "#e2e8f0", borderRadius: "4px" }}></div>
        <div style={{ width: "100px", height: "20px", background: "#e2e8f0", borderRadius: "4px" }}></div>
        <div style={{ width: "80px", height: "20px", background: "#e2e8f0", borderRadius: "4px" }}></div>
      </div>
    ))}
    <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
  </div>
);

function StudentDashboard() {
  // --- STATE MANAGEMENT ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    block: "",
    roomNo: "",
    priority: "MEDIUM",
  });

  const navigate = useNavigate();

  // --- CONFIGURATION ---
  const CATEGORIES = [
    "Electrical",
    "Plumbing",
    "Furniture",
    "Internet/Wi-Fi",
    "Cleaning/Housekeeping",
    "Civil (Doors/Windows)",
    "Mess/Food",
    "Other"
  ];

  // --- HELPER FUNCTIONS ---
  
  // 1. Format Dates cleanly
  const formatDate = (dateInput) => {
    if (!dateInput) return "-";
    // Handle Java array format [2024, 12, 25] if necessary
    if (Array.isArray(dateInput)) {
        const [year, month, day] = dateInput;
        return new Date(year, month - 1, day).toLocaleDateString();
    }
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
  };

  // --- STYLING HELPERS ---
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "HIGH": return { bg: "#ffebee", text: "#c62828" }; 
      case "MEDIUM": return { bg: "#fff3e0", text: "#ef6c00" }; 
      case "LOW": return { bg: "#e8f5e9", text: "#2e7d32" }; 
      default: return { bg: "#f5f5f5", text: "#616161" }; 
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "OPEN": return { bg: "#e0f2fe", text: "#0369a1" }; 
      case "IN_PROGRESS": return { bg: "#fef3c7", text: "#d97706" }; 
      case "RESOLVED": return { bg: "#dcfce7", text: "#15803d" }; 
      case "CLOSED": return { bg: "#f1f5f9", text: "#475569" }; 
      default: return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  // --- LOAD TICKETS (EFFECT) ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { 
        navigate("/login"); 
        return; 
    }

    const loadTickets = async () => {
      try {
        setLoading(true);
        setError("");
        
        // ✅ UPDATED: Now uses apiFetch (automatically handles BASE_URL and Auth Tokens)
        const data = await apiFetch("/api/tickets");
        setTickets(data);

      } catch (err) {
        console.error(err);
        setError(err.message);
        if (err.message.includes("Auth Error") || err.message.includes("expired")) {
            localStorage.removeItem("user");
            navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, [navigate]);

  // --- EVENT HANDLERS ---
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");

    try {
      setCreating(true);
      
      // ✅ UPDATED: Now uses apiFetch for POST (removes localhost dependency)
      const newTicket = await apiFetch("/api/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category || "Other",
          block: form.block,
          roomNo: form.roomNo,
          priority: form.priority,
        }),
      });

      setTickets((prev) => [newTicket, ...prev]);
      setForm({ title: "", description: "", category: "", block: "", roomNo: "", priority: "MEDIUM" });
      toast.success("Ticket created successfully!");
    
    } catch (err) {
      setCreateError(err.message);
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const visibleTickets = statusFilter === "ALL" ? tickets : tickets.filter((t) => t.status === statusFilter);

  // --- RENDER ---
  return (
    <div style={{ padding: "40px", backgroundColor: "#f8f9fa", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        
        {/* HEADER SECTION */}
        <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "30px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700" }}>Student Dashboard</h1>
              <p style={{ margin: "5px 0 0 0", opacity: 0.85, fontSize: "14px" }}>Report and track your hostel issues</p>
            </div>
            <button onClick={() => { localStorage.removeItem("user"); navigate("/login"); }} 
              style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
              Logout
            </button>
          </div>
        </div>

        <div style={{ padding: "30px" }}>
          
          {/* CREATE TICKET FORM */}
          <form onSubmit={handleCreate} style={{ marginBottom: "40px", padding: "25px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#fff" }}>
            <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>Create New Ticket</h2>
            
            <div style={{ marginBottom: "15px" }}>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Title (e.g. Fan Broken)"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e0", fontSize: "14px", outline: "none", boxSizing: "border-box" }} 
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} required placeholder="Detailed description..."
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e0", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box" }} 
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }}>
              
              <select name="category" value={form.category} onChange={handleChange} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e0", width: "100%", boxSizing: "border-box", background: "white" }}>
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <select name="block" value={form.block} onChange={handleChange} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e0", width: "100%", boxSizing: "border-box", background: "white" }}>
                <option value="">Select Block</option>
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Girls Hostel">Girls Hostel</option>
              </select>

              <input name="roomNo" value={form.roomNo} onChange={handleChange} placeholder="Room No" required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e0", width: "100%", boxSizing: "border-box" }} />
              
              <select name="priority" value={form.priority} onChange={handleChange} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e0", width: "100%", boxSizing: "border-box", background: "white" }}>
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e0", fontSize: "13px" }}>
                 <option value="ALL">All Status</option>
                 <option value="OPEN">Open</option>
                 <option value="RESOLVED">Resolved</option>
               </select>
               <button type="submit" disabled={creating} style={{ background: "#4f46e5", color: "white", padding: "10px 24px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", opacity: creating ? 0.7 : 1 }}>
                 {creating ? "Creating..." : "Submit Ticket"}
               </button>
            </div>
            {createError && <p style={{ color: "red", fontSize: "13px", marginTop: "10px" }}>{createError}</p>}
          </form>

          {/* TICKETS LIST AREA */}
          <div style={{ overflowX: "auto" }}>
            
            {loading && <TableSkeleton />}

            {!loading && visibleTickets.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                <thead>
                  <tr style={{ color: "#64748b", fontSize: "12px", textAlign: "left", textTransform: "uppercase", letterSpacing: "1px" }}>
                    <th style={{ padding: "15px" }}>Ticket</th>
                    <th style={{ padding: "15px" }}>Status</th>
                    <th style={{ padding: "15px" }}>Assigned To</th>
                    <th style={{ padding: "15px" }}>Priority</th>
                    <th style={{ padding: "15px" }}>Location</th>
                    <th style={{ padding: "15px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTickets.map((t) => (
                    <tr key={t.id} onClick={() => setSelectedTicket(t)} 
                        style={{ backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", cursor: "pointer", transition: "transform 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <td style={{ padding: "15px", borderRadius: "8px 0 0 8px" }}>
                        <div style={{ fontWeight: "600", color: "#334155" }}>{t.title}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{t.category}</div>
                      </td>
                      
                      <td style={{ padding: "15px" }}>
                        <span style={{ backgroundColor: getStatusStyle(t.status).bg, color: getStatusStyle(t.status).text, padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                          {t.status}
                        </span>
                      </td>

                      <td style={{ padding: "15px" }}>
                        {t.assignedToName ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "14px" }}>👤</span>
                            <span style={{ fontWeight: "600", color: "#334155", fontSize: "13px" }}>{t.assignedToName}</span>
                          </div>
                        ) : (
                           <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px", background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px" }}>
                             Waiting for staff...
                           </span>
                        )}
                      </td>

                      <td style={{ padding: "15px" }}>
                        <span style={{ backgroundColor: getPriorityStyle(t.priority).bg, color: getPriorityStyle(t.priority).text, padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600" }}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: "15px", color: "#475569" }}>{t.block ? `${t.block} - ${t.roomNo}` : (t.location || "-")}</td>
                      
                      <td style={{ padding: "15px", color: "#94a3b8", fontSize: "13px" }}>
                          {formatDate(t.createdAt)} 
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && visibleTickets.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎫</div>
                <h3 style={{ margin: "0 0 5px 0", color: "#334155" }}>No tickets found</h3>
                <p style={{ margin: 0, fontSize: "14px" }}>You haven't raised any issues yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TICKET DETAILS MODAL */}
      {selectedTicket && (
        <div onClick={() => setSelectedTicket(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(2px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", padding: "30px", borderRadius: "16px", width: "450px", maxWidth: "90%", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <h2 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>{selectedTicket.title}</h2>
            
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
               <span style={{ background: getStatusStyle(selectedTicket.status).bg, color: getStatusStyle(selectedTicket.status).text, padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>{selectedTicket.status}</span>
               {selectedTicket.assignedToName && (
                 <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>👤 {selectedTicket.assignedToName}</span>
               )}
            </div>

            <p style={{ color: "#475569", lineHeight: "1.6", background: "#f8fafc", padding: "15px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
              {selectedTicket.description}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "14px", color: "#64748b" }}>
              <div><strong>Block:</strong> {selectedTicket.block}</div>
              <div><strong>Room:</strong> {selectedTicket.roomNo}</div>
              <div><strong>Category:</strong> {selectedTicket.category}</div>
              <div><strong>Date:</strong> {formatDate(selectedTicket.createdAt)}</div>
            </div>

            <button onClick={() => setSelectedTicket(null)} style={{ width: "100%", marginTop: "25px", padding: "12px", border: "1px solid #e2e8f0", background: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#334155" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;