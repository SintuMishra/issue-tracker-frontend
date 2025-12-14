// src/StudentDashboard.jsx
import { apiFetch } from "./api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function StudentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    priority: "MEDIUM",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== "STUDENT") {
      navigate("/");
      return;
    }

    const loadTickets = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/tickets/by-user/${user.id}`
        );
        if (!res.ok) {
          throw new Error("Failed to load tickets");
        }
        const data = await res.json();
        setTickets(data);
      } catch (err) {
        const message = err.message || "Error loading tickets";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
        e.preventDefault();
        setCreateError("");

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
            return;
        }
        const user = JSON.parse(storedUser);

        try {
            setCreating(true);

            const res = await apiFetch("/api/tickets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: form.title,
                description: form.description,
                category: form.category,
                location: form.location,
                priority: form.priority,
                createdByUserId: user.id,
            }),
            });

            if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to create ticket");
            }

            const newTicket = await res.json();
            setTickets((prev) => [newTicket, ...prev]);
            setForm({
            title: "",
            description: "",
            category: "",
            location: "",
            priority: "MEDIUM",
            });

            toast.success("Ticket created successfully");
        } catch (err) {
            const message = err.message || "Error creating ticket";
            setCreateError(message);
            toast.error(message);
        } finally {
            setCreating(false);
        }
    };

  const visibleTickets =
    statusFilter === "ALL"
      ? tickets
      : tickets.filter((t) => t.status === statusFilter);

  const handleRowClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const closeModal = () => {
    setSelectedTicket(null);
  };

  return (
    <div className="page">
      <div
        className="card"
        style={{ maxWidth: 1100, width: "100%", textAlign: "left" }}
      >
        <h1>My Tickets</h1>

        {/* Create Ticket form */}
        <form
          onSubmit={handleCreate}
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 8,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Create Ticket</h2>

          <div className="auth-form" style={{ marginBottom: 12 }}>
            <label>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form" style={{ marginBottom: 12 }}>
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
              required
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div className="auth-form" style={{ flex: 1, minWidth: 160 }}>
              <label>Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Electrical, Plumbing..."
              />
            </div>

            <div className="auth-form" style={{ flex: 1, minWidth: 160 }}>
              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Hostel A4, Room 213..."
              />
            </div>

            <div className="auth-form" style={{ flex: 1, minWidth: 160 }}>
              <label>Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 4, marginBottom: 8 }}>
            <label style={{ fontSize: 14, marginRight: 8 }}>
              Filter by status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {createError && (
            <p style={{ color: "red", marginBottom: 8 }}>{createError}</p>
          )}

          <button
            type="submit"
            className="btn primary"
            disabled={creating}
            style={{ marginTop: 4 }}
          >
            {creating ? "Creating..." : "Create Ticket"}
          </button>
        </form>

        {loading && <p>Loading tickets...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && visibleTickets.length === 0 && !error && (
          <p>No tickets found. Create your first ticket!</p>
        )}

        {!loading && visibleTickets.length > 0 && (
          <table
            className="ticket-table"
            style={{ width: "100%", marginTop: 16 }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {visibleTickets.map((t) => {
                const status = t.status || "";
                const priority = t.priority || "";

                const statusClass =
                  status === "OPEN"
                    ? "badge badge-status-open"
                    : status === "IN_PROGRESS"
                    ? "badge badge-status-inprogress"
                    : status === "RESOLVED"
                    ? "badge badge-status-resolved"
                    : "badge badge-status-closed";

                const priorityClass =
                  priority === "HIGH"
                    ? "chip chip-high"
                    : priority === "LOW"
                    ? "chip chip-low"
                    : "chip chip-medium";

                return (
                  <tr
                        key={t.id}
                        onClick={() => handleRowClick(t)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleRowClick(t);
                            }
                        }}
                        tabIndex={0}
                        style={{ cursor: "pointer" }}
                    >
                    <td>{t.id}</td>
                    <td>{t.title}</td>
                    <td>{t.category || "-"}</td>
                    <td>
                      <span className={statusClass}>
                        {status || "UNKNOWN"}
                      </span>
                    </td>
                    <td>
                      <span className={priorityClass}>
                        {priority || "-"}
                      </span>
                    </td>
                    <td>{t.assignedToName || t.assignedTo || "-"}</td>
                    <td>{t.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Ticket details modal */}
      {selectedTicket && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 12,
              padding: 20,
              maxWidth: 520,
              width: "90%",
              boxShadow:
                "0 10px 25px rgba(15,23,42,0.3), 0 0 0 1px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h2 style={{ margin: 0 }}>{selectedTicket.title}</h2>
              <button
                onClick={closeModal}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <p style={{ marginTop: 0, marginBottom: 8, color: "#6b7280" }}>
              Ticket #{selectedTicket.id}
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span
                className={
                  selectedTicket.status === "OPEN"
                    ? "badge badge-status-open"
                    : selectedTicket.status === "IN_PROGRESS"
                    ? "badge badge-status-inprogress"
                    : selectedTicket.status === "RESOLVED"
                    ? "badge badge-status-resolved"
                    : "badge badge-status-closed"
                }
              >
                {selectedTicket.status}
              </span>
              <span
                className={
                  selectedTicket.priority === "HIGH"
                    ? "chip chip-high"
                    : selectedTicket.priority === "LOW"
                    ? "chip chip-low"
                    : "chip chip-medium"
                }
              >
                {selectedTicket.priority}
              </span>
            </div>

            <div style={{ marginBottom: 12 }}>
              <h4 style={{ margin: "8px 0" }}>Description</h4>
              <p style={{ margin: 0, whiteSpace: "pre-line" }}>
                {selectedTicket.description}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                fontSize: 14,
                color: "#4b5563",
              }}
            >
              <div>
                <strong>Category:</strong>{" "}
                {selectedTicket.category || "-"}
              </div>
              <div>
                <strong>Location:</strong>{" "}
                {selectedTicket.location || "-"}
              </div>
              <div>
                <strong>Assigned to:</strong>{" "}
                {selectedTicket.assignedToName ||
                  selectedTicket.assignedTo ||
                  "-"}
              </div>
              <div>
                <strong>Created at:</strong>{" "}
                {selectedTicket.createdAt}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
