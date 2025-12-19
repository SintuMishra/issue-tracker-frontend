import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; 
// 🚨 IMPORTANT: Import the apiFetch utility you created
import { apiFetch } from "../api"; 

function CreateTicket({ user }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Electrical",
    block: "",       
    roomNo: "",      
    assetId: "",
    priority: "MEDIUM",
  });

  const [created, setCreated] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  // Auto-fill logic for QR Codes
  useEffect(() => {
    const asset = searchParams.get('asset');
    const room = searchParams.get('room');
    const block = searchParams.get('block');

    if (asset) {
      setForm(prev => ({
        ...prev,
        assetId: asset,
        roomNo: room || '',
        block: block || '',
        title: `Issue with ${asset}`,
        description: `Reporting issue for asset: ${asset}`
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🚨 UPDATED: Uses apiFetch to load tickets from the production server
  const loadTickets = async () => {
    if (!user || !user.id) return;

    try {
      const data = await apiFetch(`/api/tickets/by-user/${user.id}`);
      setMyTickets(data);
    } catch (err) {
      setError("Could not load your tickets: " + err.message);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  // 🚨 UPDATED: Uses apiFetch to POST the new ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreated(null);

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      block: form.block,
      roomNo: form.roomNo,
      assetId: form.assetId || null,
      priority: form.priority.toUpperCase(), 
      createdByUserId: user?.id || 1         
    };

    console.log("Sending Payload to Production:", payload);

    try {
      // apiFetch automatically adds the Authorization header and the BASE_URL
      const data = await apiFetch("/api/tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setCreated(data);
      
      // Reset form
      setForm({
        title: "",
        description: "",
        category: "Electrical",
        block: "",
        roomNo: "",
        assetId: "",
        priority: "MEDIUM",
      });
      loadTickets();
      alert("Ticket Created Successfully!");

    } catch (err) {
      console.error("Submission Error:", err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <header>
        <h3>Create New Ticket</h3>
      </header>
      
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "15px" }}>
        {/* Title */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", minHeight: "80px" }}
          />
        </div>

        {/* Category */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Category</label>
          <select 
            name="category" 
            value={form.category} 
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Mess">Mess</option>
            <option value="Internet">Internet</option>
            <option value="Furniture">Furniture</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* BLOCK & ROOM */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>Block</label>
            <select
              name="block"
              value={form.block}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">Select Block</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
              <option value="Girls Hostel">Girls Hostel</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>Room No</label>
            <input
              name="roomNo"
              placeholder="e.g. 101"
              value={form.roomNo}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <button 
          type="submit" 
          style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}
        >
          Create Ticket
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>Error: {error}</p>}

      {created && (
        <div style={{ marginTop: 20, padding: "10px", backgroundColor: "#d4edda", color: "#155724" }}>
          <strong>Success!</strong> Ticket #{created.id} created.
        </div>
      )}

      {/* Ticket List */}
      <div style={{ marginTop: 30 }}>
        <h4>My Recent Tickets</h4>
        {myTickets.length === 0 && <p>No tickets yet.</p>}
        {myTickets.map((t) => (
          <div
            key={t.id}
            style={{ border: "1px solid #ccc", marginBottom: 10, padding: "15px", borderRadius: "5px" }}
          >
            <strong>{t.title}</strong> - {t.status}
            <div style={{ fontSize: "0.9em", color: "#555" }}>
               {t.block} | Room {t.roomNo} | {t.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CreateTicket;