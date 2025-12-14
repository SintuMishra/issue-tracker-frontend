// src/AdminPage.jsx
import { apiFetch } from "./api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [assignInputs, setAssignInputs] = useState({});
  const [statusInputs, setStatusInputs] = useState({});

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState("");

  const loadStats = async () => {
    try {
      const res = await apiFetch("/api/admin/tickets/stats");
      if (!res.ok) {
        throw new Error("Failed to load stats");
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      toast.error(err.message || "Error loading stats");
    }
  };

  const loadTickets = async (status) => {
    try {
      const params = status ? `?status=${status}` : "";
      const res = await apiFetch(`/api/admin/tickets${params}`);
      if (!res.ok) {
        throw new Error("Failed to load tickets");
      }
      const data = await res.json();
      const list = data.content || data;
      setTickets(list);

      const map = {};
      list.forEach((t) => {
        map[t.id] = t.status;
      });
      setStatusInputs(map);
    } catch (err) {
      toast.error(err.message || "Error loading tickets");
    }
  };

  useEffect(() => {
    loadTickets(statusFilter);
    loadStats();
  }, [statusFilter]);

  const handleAssignInputChange = (ticketId, value) => {
    setAssignInputs((prev) => ({
      ...prev,
      [ticketId]: value,
    }));
  };

  const handleAssign = async (ticketId) => {
    const staffId = assignInputs[ticketId];
    if (!staffId) {
      toast.error("Enter staff user ID first");
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/tickets/${ticketId}/assign`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                staffUserId: Number(staffId),
                status: "ASSIGNED",
            }),
        });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to assign ticket");
      }

      await res.json();
      await loadTickets(statusFilter);
      toast.success(`Ticket ${ticketId} assigned`);
    } catch (err) {
      console.error(err);
      toast.error("Error assigning ticket: " + (err.message || ""));
    }
  };

  const handleStatusChange = (ticketId, value) => {
    setStatusInputs((prev) => ({
      ...prev,
      [ticketId]: value,
    }));
  };

  const handleStatusUpdate = async (ticketId) => {
    const newStatus = statusInputs[ticketId];
    if (!newStatus) {
      toast.error("Choose a status first");
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/tickets/${ticketId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update status");
      }

      await res.json();
      await loadTickets(statusFilter);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Error updating status: " + (err.message || ""));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserError("");

    try {
      setCreatingUser(true);
      const res = await apiFetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
        });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create user");
      }

      await res.json();
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "ADMIN",
      });
      toast.success("User created successfully");
    } catch (err) {
      const message = err.message || "Error creating user";
      setCreateUserError(message);
      toast.error(message);
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="page">
      <div
        className="card"
        style={{ maxWidth: 960, width: "100%", textAlign: "left" }}
      >
        <h1>Admin Dashboard - Tickets</h1>

        {/* Create User */}
        <section className="create-user-card">
          <h2>Create User</h2>

          <form className="create-user-row" onSubmit={handleCreateUser}>
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, name: e.target.value }))
                }
                placeholder="Admin / Student name"
                required
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, email: e.target.value }))
                }
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, password: e.target.value }))
                }
                placeholder="Temporary password"
                required
              />
            </div>

            <div className="field">
              <label>Role</label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, role: e.target.value }))
                }
              >
                <option value="ADMIN">Admin</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            <div className="field" style={{ alignItems: "flex-end" }}>
              {createUserError && (
                <p style={{ color: "red", marginBottom: 4 }}>
                  {createUserError}
                </p>
              )}
              <button
                className="btn primary create-user-btn"
                type="submit"
                disabled={creatingUser}
              >
                {creatingUser ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </section>

        {stats && (
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <div>
              <strong>Total:</strong> {stats.totalTickets}
            </div>
            <div>
              <strong>Open:</strong> {stats.openTickets}
            </div>
            <div>
              <strong>In Progress:</strong> {stats.inProgressTickets}
            </div>
            <div>
              <strong>Resolved:</strong> {stats.resolvedTickets}
            </div>
            <div>
              <strong>Closed:</strong> {stats.closedTickets}
            </div>
          </div>
        )}

                <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 8,
            marginBottom: 4,
            alignItems: "center",
          }}
        >
          <div>
            <label>Filter by status: </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="OPEN">OPEN</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search title or creator id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: 14,
              flex: 1,
              maxWidth: 260,
            }}
          />
        </div>

        <table
          className="ticket-table"
          style={{ marginTop: 20, width: "100%" }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Assigned To</th>
              <th>Assign</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const matchesSearch = (t) => {
                    if (!searchTerm) return true;
                    const text = searchTerm.toLowerCase();
                    return (
                        t.title?.toLowerCase().includes(text) ||
                        String(t.createdById || "").toLowerCase().includes(text)
                    );
                };

                const visibleTickets = tickets.filter((t) => {
                    const statusOk =
                        statusFilter === "" ? true : t.status === statusFilter;
                    return statusOk && matchesSearch(t);
                });

                if (visibleTickets.length === 0) {
                    return (
                    <tr>
                        <td
                        colSpan="7"
                        style={{ textAlign: "center", padding: "12px" }}
                        >
                        No tickets found
                        </td>
                    </tr>
                    );
                }

              return visibleTickets.map((t) => {
                const status = t.status || "";
                const priority = t.priority || "";

                const statusClass =
                  status === "OPEN"
                    ? "badge badge-status-open"
                    : status === "ASSIGNED" || status === "IN_PROGRESS"
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
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.title}</td>
                    <td>
                      <span className={priorityClass}>{priority}</span>
                    </td>
                    <td>
                      <span className={statusClass} style={{ marginRight: 6 }}>
                        {status}
                      </span>
                      <select
                        value={statusInputs[t.id] ?? t.status}
                        onChange={(e) =>
                          handleStatusChange(t.id, e.target.value)
                        }
                        style={{ marginRight: 4 }}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                      <button onClick={() => handleStatusUpdate(t.id)}>
                        Update
                      </button>
                    </td>
                    <td>{t.createdById}</td>
                    <td>{t.assignedToId ?? "-"}</td>
                    <td>
                      <input
                        type="number"
                        placeholder="staff user id"
                        value={assignInputs[t.id] ?? ""}
                        onChange={(e) =>
                          handleAssignInputChange(t.id, e.target.value)
                        }
                        style={{
                          width: 80,
                          marginRight: 4,
                          textAlign: "center",
                        }}
                      />
                      <button onClick={() => handleAssign(t.id)}>Assign</button>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;
