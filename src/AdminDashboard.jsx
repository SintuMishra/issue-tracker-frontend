import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "./api";

// SKELETON LOADER
const TableSkeleton = () => {
  return (
    <div style={{ animation: "pulse 1.5s infinite" }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            padding: "20px",
            borderBottom: "1px solid #f1f5f9",
            gap: "15px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "20px",
              background: "#e2e8f0",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              flex: 1,
              height: "20px",
              background: "#e2e8f0",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              width: "100px",
              height: "20px",
              background: "#e2e8f0",
              borderRadius: "4px",
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

function AdminDashboard() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignStaffId, setAssignStaffId] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT", // default
    staffId: "",
    specialization: "",
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const navigate = useNavigate();

  // HELPERS
  const formatDate = (dateInput) => {
    if (!dateInput) return "-";
    if (Array.isArray(dateInput)) {
      const [year, month, day] = dateInput;
      return new Date(year, month - 1, day).toLocaleDateString();
    }
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString();
  };

  const getPriorityStyle = (p) => {
    switch (p) {
      case "HIGH":
        return { bg: "#fee2e2", text: "#b91c1c" };
      case "MEDIUM":
        return { bg: "#ffedd5", text: "#c2410c" };
      case "LOW":
        return { bg: "#dcfce7", text: "#15803d" };
      default:
        return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  const getStatusStyle = (s) => {
    switch (s) {
      case "OPEN":
        return { bg: "#e0f2fe", text: "#0369a1" };
      case "ASSIGNED":
        return { bg: "#f3e8ff", text: "#7e22ce" };
      case "INPROGRESS":
        return { bg: "#fef08a", text: "#854d0e" };
      case "RESOLVED":
        return { bg: "#bbf7d0", text: "#166534" };
      case "CLOSED":
        return { bg: "#f1f5f9", text: "#475569" };
      default:
        return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  // API CALLS
  const loadData = async () => {
    setLoading(true);
    try {
      const statsData = await apiFetch("api/admin/tickets/stats");
      setStats(statsData);

      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", page);
      params.append("size", pageSize);

      const ticketsPage = await apiFetch(
        `api/admin/tickets?${params.toString()}`
      );
      setTickets(ticketsPage.content || []);
      setTotalPages((ticketsPage.totalPages || 1) - 1);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, page]);

  const handleAssign = async () => {
    if (!assignStaffId) {
      toast.error("Enter Staff ID");
      return;
    }
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/admin/tickets/${selectedTicket.id}/assign`, {
        method: "PUT",
        body: JSON.stringify({
          // make sure this matches backend field
          staffId: assignStaffId,
          status: "ASSIGNED",
        }),
      });
      toast.success("Assigned!");
      await loadData();
      setSelectedTicket(null);
      setAssignStaffId("");
      setNewStatus("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to assign");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error("Select Status");
      return;
    }
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      await apiFetch(`api/admin/tickets/${selectedTicket.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Updated!");
      await loadData();
      setSelectedTicket(null);
      setAssignStaffId("");
      setNewStatus("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await apiFetch("api/auth/register", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      toast.success("User created!");
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        staffId: "",
        specialization: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create user");
    } finally {
      setCreatingUser(false);
    }
  };

  // SEARCH FILTER LOGIC
  const filteredTickets = tickets.filter((t) => {
    const search = searchTerm.toLowerCase();
    if (!search) return true;
    return (
      (t.title && t.title.toLowerCase().includes(search)) ||
      (t.id && t.id.toString().includes(search)) ||
      (t.category && t.category.toLowerCase().includes(search)) ||
      (t.createdByName &&
        t.createdByName.toLowerCase().includes(search)) ||
      (t.blockName && t.blockName.toLowerCase().includes(search))
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* HERO HEADER */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
          padding: "60px 0 100px",
          color: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  background: "rgba(255,255,255,0.1)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                  border:
                    "1px solid rgba(255,255,255,0.2)",
                }}
              >
                ADMIN PORTAL
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Dashboard Overview
            </h1>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border:
                "1px solid rgba(255,255,255,0.2)",
              padding: "10px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              backdropFilter: "blur(4px)",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "-60px auto 40px",
          padding: "0 20px",
        }}
      >
        {/* STATS CARDS */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            {[
              {
                label: "Total Tickets",
                val: stats.totalTickets,
                grad:
                  "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              },
              {
                label: "Pending",
                val: stats.openTickets,
                grad:
                  "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              },
              {
                label: "In Progress",
                val: stats.inProgressTickets,
                grad:
                  "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              },
              {
                label: "Resolved",
                val: stats.resolvedTickets,
                grad:
                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: s.grad,
                  padding: "24px",
                  borderRadius: "16px",
                  color: "white",
                  boxShadow:
                    "0 10px 20px -5px rgba(0,0,0,0.2)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    fontWeight: 700,
                    opacity: 0.9,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {s.label}
                </p>
                <h2
                  style={{
                    margin: "5px 0 0",
                    fontSize: "36px",
                    fontWeight: 800,
                  }}
                >
                  {s.val}
                </h2>
                <div
                  style={{
                    position: "absolute",
                    right: "-20px",
                    top: "-20px",
                    width: "100px",
                    height: "100px",
                    background: "white",
                    opacity: 0.1,
                    borderRadius: "50%",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* LOWER SECTION */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "340px 1fr",
            gap: "30px",
            alignItems: "flex-start",
          }}
        >
          {/* LEFT COLUMN */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              position: "sticky",
              top: "20px",
            }}
          >
            {/* CREATE USER CARD */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                boxShadow:
                  "0 10px 25px -5px rgba(0,0,0,0.05)",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(to right, #4f46e5, #6366f1)",
                  padding: "20px",
                  color: "white",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>User Management</span>
                </h3>
              </div>
              <div
                style={{
                  padding: "24px",
                  background: "#f8fafc",
                }}
              >
                <form
                  onSubmit={handleCreateUser}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <input
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        name: e.target.value,
                      })
                    }
                    required
                    placeholder="Full Name"
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e0",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        email: e.target.value,
                      })
                    }
                    required
                    placeholder="Email Address"
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e0",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        password: e.target.value,
                      })
                    }
                    required
                    placeholder="Password"
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e0",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value,
                      })
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e0",
                      fontSize: "14px",
                      background: "white",
                    }}
                  >
                    <option value="STUDENT">
                      Student
                    </option>
                    <option value="STAFF">
                      Staff Member
                    </option>
                    <option value="ADMIN">
                      Admin
                    </option>
                  </select>

                  {/* CONDITIONAL STAFF FIELDS */}
                  {newUser.role === "STAFF" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        padding: "15px",
                        border:
                          "1px dashed #cbd5e0",
                        borderRadius: "8px",
                        background: "#f1f5f9",
                      }}
                    >
                      <input
                        value={newUser.staffId}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            staffId: e.target.value,
                          })
                        }
                        required
                        placeholder="Staff ID / Employee No"
                        style={{
                          padding: "10px",
                          borderRadius: "6px",
                          border:
                            "1px solid #cbd5e0",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                      <select
                        value={
                          newUser.specialization
                        }
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            specialization:
                              e.target.value,
                          })
                        }
                        required
                        style={{
                          padding: "10px",
                          borderRadius: "6px",
                          border:
                            "1px solid #cbd5e0",
                          fontSize: "13px",
                          background: "white",
                        }}
                      >
                        <option value="">
                          Select Specialization
                        </option>
                        <option value="PLUMBER">
                          Plumber
                        </option>
                        <option value="ELECTRICIAN">
                          Electrician
                        </option>
                        <option value="WARDEN">
                          Warden
                        </option>
                        <option value="ITSUPPORT">
                          IT Support
                        </option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={creatingUser}
                    style={{
                      marginTop: "8px",
                      background: "#1e293b",
                      color: "white",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "0.2s",
                      opacity: creatingUser
                        ? 0.7
                        : 1,
                    }}
                  >
                    {creatingUser
                      ? "Creating..."
                      : "Create Account"}
                  </button>
                </form>
              </div>
            </div>

            {/* FILTER CARD */}
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                boxShadow:
                  "0 4px 6px -1px rgba(0,0,0,0.05)",
                borderLeft: "5px solid #3b82f6",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  color: "#1e293b",
                }}
              >
                Ticket Filter
              </h3>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e0",
                  fontSize: "14px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <option value="">
                  View All Tickets
                </option>
                <option value="OPEN">
                  Open Only
                </option>
                <option value="ASSIGNED">
                  Assigned Only
                </option>
                <option value="RESOLVED">
                  Resolved Only
                </option>
                <option value="CLOSED">
                  Closed Only
                </option>
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN TABLE */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow:
                "0 10px 25px -5px rgba(0,0,0,0.05)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              minHeight: "500px",
            }}
          >
            {/* TOOLBAR */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom:
                  "1px solid #e2e8f0",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#1e293b",
                  fontWeight: 700,
                }}
              >
                Recent Tickets
              </h3>
              <input
                type="text"
                placeholder="Search ticket, name, or room..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                style={{
                  padding: "10px 16px",
                  borderRadius: "20px",
                  border: "1px solid #cbd5e0",
                  width: "250px",
                  fontSize: "13px",
                  outline: "none",
                  background: "#f8fafc",
                }}
              />
            </div>

            {loading ? (
              <TableSkeleton />
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background:
                            "linear-gradient(to right, #1e293b, #334155)",
                          color: "white",
                          textAlign: "left",
                          fontSize: "12px",
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.8px",
                        }}
                      >
                        <th
                          style={{
                            padding: "18px 24px",
                            fontWeight: 600,
                          }}
                        >
                          Details
                        </th>
                        <th
                          style={{
                            padding: "18px",
                            fontWeight: 600,
                          }}
                        >
                          Location
                        </th>
                        <th
                          style={{
                            padding: "18px",
                            fontWeight: 600,
                          }}
                        >
                          Reported By
                        </th>
                        <th
                          style={{
                            padding: "18px",
                            fontWeight: 600,
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            padding: "18px",
                            fontWeight: 600,
                          }}
                        >
                          Priority
                        </th>
                        <th
                          style={{
                            padding: "18px 24px",
                            fontWeight: 600,
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              padding: "50px",
                              textAlign: "center",
                              color: "#94a3b8",
                            }}
                          >
                            No tickets found.
                          </td>
                        </tr>
                      ) : (
                        filteredTickets.map((t) => (
                          <tr
                            key={t.id}
                            onClick={() => {
                              setSelectedTicket(t);
                              setAssignStaffId(
                                t.staffId || ""
                              );
                              setNewStatus(
                                t.status || ""
                              );
                            }}
                            style={{
                              borderBottom:
                                "1px solid #f1f5f9",
                              cursor: "pointer",
                              transition:
                                "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "#f8fafc";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "white";
                            }}
                          >
                            {/* DETAILS */}
                            <td
                              style={{
                                padding:
                                  "20px 24px",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#334155",
                                  fontSize:
                                    "14px",
                                }}
                              >
                                {t.title}
                              </div>
                              <div
                                style={{
                                  fontSize:
                                    "12px",
                                  color: "#64748b",
                                  marginTop:
                                    "4px",
                                }}
                              >
                                #{t.id} •{" "}
                                {t.category}
                              </div>
                              <div
                                style={{
                                  fontSize:
                                    "11px",
                                  color: "#94a3b8",
                                  marginTop:
                                    "2px",
                                }}
                              >
                                {formatDate(
                                  t.createdAt
                                )}
                              </div>
                            </td>

                            {/* LOCATION */}
                            <td
                              style={{
                                padding:
                                  "20px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize:
                                    "13px",
                                  fontWeight: 600,
                                  color: "#475569",
                                }}
                              >
                                {t.blockName ||
                                  "NA"}
                              </div>
                              <div
                                style={{
                                  fontSize:
                                    "11px",
                                  color: "#94a3b8",
                                }}
                              >
                                Room{" "}
                                {t.roomNo ||
                                  "-"}
                              </div>
                            </td>

                            {/* REPORTED BY */}
                            <td
                              style={{
                                padding:
                                  "20px",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    width:
                                      "24px",
                                    height:
                                      "24px",
                                    background:
                                      "#e2e8f0",
                                    borderRadius:
                                      "50%",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    fontSize:
                                      "10px",
                                    color:
                                      "#64748b",
                                    fontWeight:
                                      "bold",
                                  }}
                                >
                                  {t.createdByName
                                    ? t.createdByName.charAt(
                                        0
                                      )
                                    : "?"}
                                </div>
                                <span
                                  style={{
                                    fontSize:
                                      "13px",
                                    color:
                                      "#334155",
                                  }}
                                >
                                  {t.createdByName ||
                                    "Unknown"}
                                </span>
                              </div>
                            </td>

                            {/* STATUS */}
                            <td
                              style={{
                                padding:
                                  "20px",
                              }}
                            >
                              {(() => {
                                const s =
                                  getStatusStyle(
                                    t.status
                                  );
                                return (
                                  <span
                                    style={{
                                      background:
                                        s.bg,
                                      color:
                                        s.text,
                                      padding:
                                        "6px 12px",
                                      borderRadius:
                                        "20px",
                                      fontSize:
                                        "11px",
                                      fontWeight:
                                        800,
                                      letterSpacing:
                                        "0.5px",
                                    }}
                                  >
                                    {t.status}
                                  </span>
                                );
                              })()}
                            </td>

                            {/* PRIORITY */}
                            <td
                              style={{
                                padding:
                                  "20px",
                              }}
                            >
                              {(() => {
                                const p =
                                  getPriorityStyle(
                                    t.priority
                                  );
                                return (
                                  <span
                                    style={{
                                      background:
                                        p.bg,
                                      color:
                                        p.text,
                                      padding:
                                        "6px 12px",
                                      borderRadius:
                                        "6px",
                                      fontSize:
                                        "11px",
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    {t.priority}
                                  </span>
                                );
                              })()}
                            </td>

                            {/* ACTION (ASSIGNED TO) */}
                            <td
                              style={{
                                padding:
                                  "20px 24px",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {t.assignedToName ? (
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "8px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width:
                                        "24px",
                                      height:
                                        "24px",
                                      background:
                                        "#3b82f6",
                                      color:
                                        "white",
                                      borderRadius:
                                        "50%",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      fontSize:
                                        "10px",
                                    }}
                                  >
                                    {t.assignedToName.charAt(
                                      0
                                    )}
                                  </div>
                                  <span
                                    style={{
                                      fontWeight:
                                        600,
                                      color:
                                        "#334155",
                                    }}
                                  >
                                    {
                                      t.assignedToName
                                    }
                                  </span>
                                </div>
                              ) : (
                                <span
                                  style={{
                                    color:
                                      "#cbd5e1",
                                    fontStyle:
                                      "italic",
                                  }}
                                >
                                  Unassigned
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {totalPages >= 0 && (
                  <div
                    style={{
                      padding: "12px 24px",
                      borderTop:
                        "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      Page {page + 1} of{" "}
                      {totalPages + 1}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() =>
                          setPage((p) =>
                            Math.max(p - 1, 0)
                          )
                        }
                        disabled={page === 0}
                        style={{
                          padding:
                            "6px 10px",
                          fontSize: "12px",
                        }}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setPage((p) =>
                            p + 1 >
                            totalPages
                              ? p
                              : p + 1
                          )
                        }
                        disabled={
                          page >= totalPages
                        }
                        style={{
                          padding:
                            "6px 10px",
                          fontSize: "12px",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedTicket && (
        <div
          onClick={() =>
            setSelectedTicket(null)
          }
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "24px",
              width: "500px",
              maxWidth: "90%",
              overflow: "hidden",
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(to right, #1e293b, #334155)",
                padding: "24px",
                color: "white",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                  }}
                >
                  Manage Ticket{" "}
                  {selectedTicket.id}
                </h2>
                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "13px",
                    opacity: 0.8,
                  }}
                >
                  Created on{" "}
                  {formatDate(
                    selectedTicket.createdAt
                  )}{" "}
                  by{" "}
                  <strong>
                    {
                      selectedTicket.createdByName
                    }
                  </strong>
                </p>
              </div>
              <button
                onClick={() =>
                  setSelectedTicket(null)
                }
                style={{
                  background:
                    "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "white",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "30px" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  background: "#f1f5f9",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "16px",
                }}
              >
                {selectedTicket.blockName ||
                  "No Block"}{" "}
                • Room{" "}
                {selectedTicket.roomNo || "NA"}
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "30px",
                }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform:
                      "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Issue Description
                </label>
                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#334155",
                    lineHeight: 1.6,
                    fontSize: "15px",
                  }}
                >
                  {selectedTicket.description}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "20px",
                }}
              >
                {/* ASSIGN STAFF */}
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    ASSIGN STAFF ID
                  </label>
                  <input
                    type="number"
                    placeholder="Staff ID"
                    value={assignStaffId}
                    onChange={(e) =>
                      setAssignStaffId(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border:
                        "1px solid #cbd5e0",
                      fontSize: "14px",
                      boxSizing:
                        "border-box",
                    }}
                  />
                  <button
                    onClick={handleAssign}
                    disabled={actionLoading}
                    style={{
                      width: "100%",
                      marginTop: "12px",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      padding: "12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      opacity: actionLoading
                        ? 0.7
                        : 1,
                    }}
                  >
                    Assign
                  </button>
                </div>

                {/* UPDATE STATUS */}
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    UPDATE STATUS
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border:
                        "1px solid #cbd5e0",
                      background: "white",
                      fontSize: "14px",
                      boxSizing:
                        "border-box",
                    }}
                  >
                    <option value="">
                      Select...
                    </option>
                    <option value="OPEN">
                      Open
                    </option>
                    <option value="INPROGRESS">
                      In Progress
                    </option>
                    <option value="RESOLVED">
                      Resolved
                    </option>
                    <option value="CLOSED">
                      Closed
                    </option>
                  </select>
                  <button
                    onClick={
                      handleUpdateStatus
                    }
                    disabled={actionLoading}
                    style={{
                      width: "100%",
                      marginTop: "12px",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      padding: "12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      opacity: actionLoading
                        ? 0.7
                        : 1,
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
