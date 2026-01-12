import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";


export default function App() {
  const API = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    []
  );

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [rowLoading, setRowLoading] = useState({});

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  async function loadMessages() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/messages`);
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${API}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      if (!res.ok) throw new Error(`Failed to save (${res.status})`);
      setText("");
      await loadMessages();
    } catch (e) {
      setError(e?.message || "Failed to save message");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditText(item.text);
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function updateMessage(id) {
    const value = editText.trim();
    if (!value) return;

    setError("");
    setRowLoading((prev) => ({ ...prev, [id]: "saving" }));
    try {
      const res = await fetch(`${API}/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      if (!res.ok) throw new Error(`PUT /messages/${id} failed (${res.status})`);
      setEditingId(null);
      setEditText("");
      await loadMessages();
    } catch (e) {
      setError(e?.message || "Failed to update message");
    } finally {
      setRowLoading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  async function deleteMessage(id) {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    setError("");
    setRowLoading((prev) => ({ ...prev, [id]: "deleting" }));
    try {
      const res = await fetch(`${API}/messages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`DELETE /messages/${id} failed (${res.status})`);
      await loadMessages();
    } catch (e) {
      setError(e?.message || "Failed to delete message");
    } finally {
      setRowLoading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <div className="card">
        <h1>Messages</h1>

        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
          />
          <button className="btn" type="submit" disabled={saving || !text.trim()}>
            {saving ? "Saving…" : "Save"}
          </button>
        </form>

        {error ? <div className="alert">{error}</div> : null}

        {loading ? (
          <div className="empty">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="empty">No messages yet.</div>
        ) : (
          <ul>
            {messages
  .slice()
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .map((m) => (
    <li key={m.id}>
      <div>{m.text}</div>
      {m.created_at ? (
        <small style={{ opacity: 0.7 }}>
          {new Date(m.created_at).toLocaleString()}
        </small>
      ) : null}
    </li>
  ))}
          </ul>
        )}
      </div>
    </div>
  );
}
