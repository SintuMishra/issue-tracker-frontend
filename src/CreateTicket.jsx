import { useState, useEffect } from "react";

function CreateTicket({ user }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    priority: "MEDIUM",
  });
  const [created, setCreated] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loadTickets = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/by-user/${user.id}`
      );
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = await res.json();
      setMyTickets(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreated(null);

    try {
      const res = await fetch("http://localhost:8080/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          createdByUserId: user.id,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create ticket");
      }

      const data = await res.json();
      setCreated(data);
      setForm({
        title: "",
        description: "",
        category: "",
        location: "",
        priority: "MEDIUM",
      });
      loadTickets();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <button type="submit">Create Ticket</button>
      </form>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {created && (
        <div style={{ marginTop: 20 }}>
          <h4>Created ticket:</h4>
          <pre>{JSON.stringify(created, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <h4>My Tickets</h4>
        {myTickets.length === 0 && <p>No tickets yet.</p>}
        {myTickets.map((t) => (
          <div
            key={t.id}
            style={{ border: "1px solid #ccc", marginBottom: 10, padding: 8 }}
          >
            <strong>{t.title}</strong> ({t.priority}) - {t.status}
            <div>
              {t.category} @ {t.location}
            </div>

            {t.status === "OPEN" && (
              <button
                style={{ marginTop: 5 }}
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `http://localhost:8080/api/tickets/${t.id}/status`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "RESOLVED" }),
                      }
                    );
                    if (!res.ok) throw new Error("Failed to update");
                    await res.json();
                    loadTickets();
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                Mark as Resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CreateTicket;