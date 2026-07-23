import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("hms_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [page, setPage] = useState("team");

  const handleLogin = (userData) => {
    localStorage.setItem("hms_user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("hms_user");
    setUser(null);
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <TopNav user={user} page={page} setPage={setPage} onLogout={handleLogout} />
      <div className="main-content">
        {page === "team" && <TeamPage user={user} />}
        {page === "submit" && <SubmitPage user={user} />}
      </div>
    </div>
  );
}

/* ---------------- Top Navigation ---------------- */
function TopNav({ user, page, setPage, onLogout }) {
  return (
    <div className="topnav">
      <div className="brand">
        <span className="brand-dot"></span>
        <span className="brand-prompt">$</span> hackOS
      </div>
      <div className="nav-tabs">
        <button className={`nav-tab ${page === "team" ? "active" : ""}`} onClick={() => setPage("team")}>
          Team
        </button>
        <button className={`nav-tab ${page === "submit" ? "active" : ""}`} onClick={() => setPage("submit")}>
          Submission
        </button>
      </div>
      <div className="nav-user">
        {user.name} · {user.role}
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

/* ---------------- Auth Page (Login/Register) ---------------- */
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">$ hackOS init</div>
        <div className="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</div>
        <div className="auth-subtitle">
          {mode === "login" ? "Log in to manage your team and submission." : "Register to join the hackathon."}
        </div>

        <div className="auth-toggle">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="field">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}
      </div>
    </div>
  );
}

/* ---------------- Team Page ---------------- */
function TeamPage({ user }) {
  const [team, setTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchTeam = async () => {
    try {
      const res = await axios.get(`${API_URL}/teams/my-team`, authHeader);
      setTeam(res.data);
    } catch {
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      await axios.post(`${API_URL}/teams`, { name: teamName }, authHeader);
      setMessage({ type: "success", text: "Team created." });
      fetchTeam();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Could not create team" });
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      await axios.post(`${API_URL}/teams/join`, { inviteCode }, authHeader);
      setMessage({ type: "success", text: "Joined team." });
      fetchTeam();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Could not join team" });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(team.inviteCode);
    setMessage({ type: "success", text: "Invite code copied." });
  };

  if (loading) return null;

  return (
    <>
      <div className="page-eyebrow">01 · Team</div>
      <div className="page-title">Your team</div>
      <div className="page-subtitle">Create a new team or join one using an invite code.</div>

      {team ? (
        <div className="card">
          <div className="card-header">
            <div className="card-title">{team.name}</div>
          </div>
          <ul className="member-list">
            {team.members.map((m) => (
              <li className="member-item" key={m._id}>
                <span className="member-avatar">{m.name.charAt(0).toUpperCase()}</span>
                {m.name}
                {m._id === team.leader._id && <span className="leader-badge">Leader</span>}
              </li>
            ))}
          </ul>
          <div className="invite-code-box">
            <div>
              <div className="label">Invite code</div>
              <div className="code">{team.inviteCode}</div>
            </div>
            <button className="copy-btn" onClick={copyCode}>Copy</button>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Create a team</div>
            </div>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Team name</label>
                <input value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
              </div>
              <button className="btn-primary" type="submit">Create team</button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Join a team</div>
            </div>
            <form onSubmit={handleJoin}>
              <div className="field">
                <label>Invite code</label>
                <input className="mono-input" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required />
              </div>
              <button className="btn-secondary" type="submit">Join team</button>
            </form>
          </div>
        </>
      )}

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
    </>
  );
}

/* ---------------- Submission Page ---------------- */
function SubmitPage({ user }) {
  const [form, setForm] = useState({ title: "", description: "", repoLink: "", demoLink: "", techStack: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [existing, setExisting] = useState(null);

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    axios
      .get(`${API_URL}/submissions/my-submission`, authHeader)
      .then((res) => {
        setExisting(res.data);
        setForm({
          title: res.data.title,
          description: res.data.description,
          repoLink: res.data.repoLink,
          demoLink: res.data.demoLink || "",
          techStack: (res.data.techStack || []).join(", "),
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      const payload = { ...form, techStack: form.techStack.split(",").map((t) => t.trim()).filter(Boolean) };
      const res = await axios.post(`${API_URL}/submissions`, payload, authHeader);
      setExisting(res.data);
      setMessage({ type: "success", text: existing ? "Submission updated." : "Submission saved." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Something went wrong" });
    }
  };

  return (
    <>
      <div className="page-eyebrow">02 · Submission</div>
      <div className="page-title">Project submission</div>
      <div className="page-subtitle">
        {existing ? "You can update your submission until the deadline." : "Submit your project once your team is ready."}
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Project title</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>GitHub repo link</label>
            <input className="mono-input" name="repoLink" value={form.repoLink} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Demo link (optional)</label>
            <input className="mono-input" name="demoLink" value={form.demoLink} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Tech stack (comma separated)</label>
            <input className="mono-input" name="techStack" value={form.techStack} onChange={handleChange} placeholder="react, node, mongodb" />
          </div>

          {form.techStack && (
            <div className="chip-row">
              {form.techStack.split(",").map((t) => t.trim()).filter(Boolean).map((t, i) => (
                <span className="chip" key={i}>{t}</span>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <button className="btn-primary" type="submit">
              {existing ? "Update submission" : "Submit project"}
            </button>
          </div>
        </form>
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
    </>
  );
}

export default App;
