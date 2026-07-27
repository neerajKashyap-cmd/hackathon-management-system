import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("hms_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuth, setShowAuth] = useState(false);
  const [page, setPage] = useState(null);

  const handleLogin = (userData) => {
    localStorage.setItem("hms_user", JSON.stringify(userData));
    setUser(userData);
    setPage(userData.role === "judge" ? "judging" : userData.role === "admin" ? "admin" : "team");
  };

  const handleLogout = () => {
    localStorage.removeItem("hms_user");
    setUser(null);
    setShowAuth(false);
    setPage(null);
  };

  if (!user) {
    if (!showAuth) {
      return <LandingPage onGetStarted={() => setShowAuth(true)} />;
    }
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <TopNav user={user} page={page} setPage={setPage} onLogout={handleLogout} />
      <div className="main-content">
        {page === "team" && <TeamPage user={user} />}
        {page === "submit" && <SubmitPage user={user} />}
        {page === "judging" && <JudgingPage user={user} />}
        {page === "leaderboard" && <LeaderboardPage user={user} />}
        {page === "admin" && <AdminPage user={user} />}
        {page === "announcements" && <AnnouncementsPage user={user} />}
      </div>
    </div>
  );
}

/* ---------------- Landing Page ---------------- */
function LandingPage({ onGetStarted }) {
  return (
    <div className="landing">
      <div className="landing-nav">
        <div className="brand">
          <span className="brand-dot"></span>
          <span className="brand-prompt">$</span> hackOS
        </div>
        <button className="btn-secondary landing-nav-btn" onClick={onGetStarted}>Log in</button>
      </div>

      <div className="landing-hero">
        <div className="landing-eyebrow">$ init --hackathon-management-system</div>
        <h1 className="landing-title">
          Build. Submit. <span className="highlight">Get judged.</span>
        </h1>
        <p className="landing-subtitle">
          One place to form your team, ship your project, and track where you stand on the leaderboard —
          built for hackathons that move fast.
        </p>
        <button className="btn-primary landing-cta" onClick={onGetStarted}>
          Get started →
        </button>

        <div className="landing-stats">
          <div className="stat-card">
            <div className="stat-number">01</div>
            <div className="stat-label">Form or join a team</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">02</div>
            <div className="stat-label">Submit your project</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">03</div>
            <div className="stat-label">Get scored by judges</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Top Navigation ---------------- */
function TopNav({ user, page, setPage, onLogout }) {
  const isJudge = user.role === "judge";
  const isAdmin = user.role === "admin";
  return (
    <div className="topnav">
      <div className="brand">
        <span className="brand-dot"></span>
        <span className="brand-prompt">$</span> hackOS
      </div>
      <div className="nav-tabs">
        {!isJudge && !isAdmin && (
          <>
            <button className={`nav-tab ${page === "team" ? "active" : ""}`} onClick={() => setPage("team")}>
              Team
            </button>
            <button className={`nav-tab ${page === "submit" ? "active" : ""}`} onClick={() => setPage("submit")}>
              Submission
            </button>
          </>
        )}
        {isJudge && (
          <button className={`nav-tab ${page === "judging" ? "active" : ""}`} onClick={() => setPage("judging")}>
            Judging
          </button>
        )}
        {isAdmin && (
          <button className={`nav-tab ${page === "admin" ? "active" : ""}`} onClick={() => setPage("admin")}>
            Admin
          </button>
        )}
        <button className={`nav-tab ${page === "announcements" ? "active" : ""}`} onClick={() => setPage("announcements")}>
          Announcements
        </button>
        <button className={`nav-tab ${page === "leaderboard" ? "active" : ""}`} onClick={() => setPage("leaderboard")}>
          Leaderboard
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
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "participant" });
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
          {mode === "register" && (
            <div className="field">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="participant">Participant</option>
                <option value="judge">Judge</option>
              </select>
            </div>
          )}

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

/* ---------------- Judging Page ---------------- */
function JudgingPage({ user }) {
  const [teams, setTeams] = useState([]);
  const [openTeamId, setOpenTeamId] = useState(null);
  const [scoreForm, setScoreForm] = useState({ innovation: 5, technical: 5, presentation: 5, impact: 5, feedback: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${API_URL}/judging/assigned-teams`, authHeader);
      setTeams(res.data);
    } catch {
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openScoreForm = (entry) => {
    setOpenTeamId(entry.team._id);
    setScoreForm(
      entry.myScore
        ? {
            innovation: entry.myScore.innovation,
            technical: entry.myScore.technical,
            presentation: entry.myScore.presentation,
            impact: entry.myScore.impact,
            feedback: entry.myScore.feedback || "",
          }
        : { innovation: 5, technical: 5, presentation: 5, impact: 5, feedback: "" }
    );
  };

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    setScoreForm({ ...scoreForm, [name]: name === "feedback" ? value : Number(value) });
  };

  const submitScore = async (teamId) => {
    setMessage({ type: "", text: "" });
    try {
      await axios.post(`${API_URL}/judging/score`, { teamId, ...scoreForm }, authHeader);
      setMessage({ type: "success", text: "Score submitted." });
      setOpenTeamId(null);
      fetchTeams();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Could not submit score" });
    }
  };

  if (loading) return null;

  return (
    <>
      <div className="page-eyebrow">03 · Judging</div>
      <div className="page-title">Score submissions</div>
      <div className="page-subtitle">Rate each team across four criteria (0–10 each).</div>

      {teams.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="icon">$ _</div>
            <p>No teams to judge yet.</p>
          </div>
        </div>
      )}

      {teams.map((entry) => (
        <div className="card" key={entry.team._id}>
          <div className="card-header">
            <div className="card-title">{entry.team.name}</div>
            {entry.myScore && <span className="leader-badge">Scored · {entry.myScore.totalScore}/40</span>}
          </div>

          {entry.submission ? (
            <>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 6 }}>
                {entry.submission.title}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{entry.submission.description}</p>
              <div className="chip-row">
                {(entry.submission.techStack || []).map((t, i) => (
                  <span className="chip" key={i}>{t}</span>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>No submission yet from this team.</p>
          )}

          {openTeamId === entry.team._id ? (
            <div style={{ marginTop: 18 }}>
              {["innovation", "technical", "presentation", "impact"].map((criteria) => (
                <div className="field" key={criteria}>
                  <label>{criteria} ({scoreForm[criteria]}/10)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    name={criteria}
                    value={scoreForm[criteria]}
                    onChange={handleScoreChange}
                  />
                </div>
              ))}
              <div className="field">
                <label>Feedback (optional)</label>
                <textarea name="feedback" value={scoreForm.feedback} onChange={handleScoreChange} />
              </div>
              <button className="btn-primary" onClick={() => submitScore(entry.team._id)}>
                Submit score
              </button>
            </div>
          ) : (
            <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => openScoreForm(entry)}>
              {entry.myScore ? "Edit score" : "Score this team"}
            </button>
          )}
        </div>
      ))}

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
    </>
  );
}

/* ---------------- Leaderboard Page ---------------- */
function LeaderboardPage({ user }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/judging/leaderboard`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => setRows(res.data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [user.token]);

  if (loading) return null;

  return (
    <>
      <div className="page-eyebrow">04 · Rankings</div>
      <div className="page-title">Leaderboard</div>
      <div className="page-subtitle">Ranked by average score across all judges.</div>

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty-state">
            <div className="icon">$ _</div>
            <p>No scores submitted yet. Check back once judging begins.</p>
          </div>
        ) : (
          <ul className="member-list">
            {rows.map((row, i) => (
              <li className="member-item" key={row.teamId}>
                <span className="member-avatar">{i + 1}</span>
                {row.teamName}
                <span className="leader-badge">{row.averageScore}/40 · {row.judgeCount} judge{row.judgeCount > 1 ? "s" : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* ---------------- Admin Page ---------------- */
function AdminPage({ user }) {
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: "",
    theme: "",
    description: "",
    rules: "",
    registrationDeadline: "",
    submissionDeadline: "",
  });
  const [assignForm, setAssignForm] = useState({ teamId: "", judgeId: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchAll = async () => {
    try {
      const [eventsRes, teamsRes, judgesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/events`, authHeader),
        axios.get(`${API_URL}/admin/teams`, authHeader),
        axios.get(`${API_URL}/admin/judges`, authHeader),
      ]);
      setEvents(eventsRes.data);
      setTeams(teamsRes.data);
      setJudges(judgesRes.data);
    } catch (err) {
      setMessage({ type: "error", text: "Could not load admin data" });
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEventChange = (e) => setEventForm({ ...eventForm, [e.target.name]: e.target.value });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      await axios.post(`${API_URL}/admin/events`, eventForm, authHeader);
      setMessage({ type: "success", text: "Event created." });
      setEventForm({ title: "", theme: "", description: "", rules: "", registrationDeadline: "", submissionDeadline: "" });
      fetchAll();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Could not create event" });
    }
  };

  const handleAssignJudge = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    if (!assignForm.teamId || !assignForm.judgeId) {
      setMessage({ type: "error", text: "Select both a team and a judge" });
      return;
    }
    try {
      await axios.post(`${API_URL}/admin/assign-judge`, assignForm, authHeader);
      setMessage({ type: "success", text: "Judge assigned." });
      fetchAll();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Could not assign judge" });
    }
  };

  return (
    <>
      <div className="page-eyebrow">05 · Admin</div>
      <div className="page-title">Admin console</div>
      <div className="page-subtitle">Create the hackathon event and assign judges to teams.</div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Create event</div>
        </div>
        <form onSubmit={handleCreateEvent}>
          <div className="field">
            <label>Title</label>
            <input name="title" value={eventForm.title} onChange={handleEventChange} required />
          </div>
          <div className="field">
            <label>Theme</label>
            <input name="theme" value={eventForm.theme} onChange={handleEventChange} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea name="description" value={eventForm.description} onChange={handleEventChange} />
          </div>
          <div className="field">
            <label>Rules</label>
            <textarea name="rules" value={eventForm.rules} onChange={handleEventChange} />
          </div>
          <div className="field">
            <label>Registration deadline</label>
            <input type="date" name="registrationDeadline" value={eventForm.registrationDeadline} onChange={handleEventChange} required />
          </div>
          <div className="field">
            <label>Submission deadline</label>
            <input type="date" name="submissionDeadline" value={eventForm.submissionDeadline} onChange={handleEventChange} required />
          </div>
          <button className="btn-primary" type="submit">Create event</button>
        </form>
      </div>

      {events.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Existing events</div>
          </div>
          <ul className="member-list">
            {events.map((ev) => (
              <li className="member-item" key={ev._id}>
                <span className="member-avatar">{ev.title.charAt(0).toUpperCase()}</span>
                {ev.title}
                {ev.theme && <span className="leader-badge">{ev.theme}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Assign judge to team</div>
        </div>
        <form onSubmit={handleAssignJudge}>
          <div className="field">
            <label>Team</label>
            <select
              value={assignForm.teamId}
              onChange={(e) => setAssignForm({ ...assignForm, teamId: e.target.value })}
            >
              <option value="">Select a team</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Judge</label>
            <select
              value={assignForm.judgeId}
              onChange={(e) => setAssignForm({ ...assignForm, judgeId: e.target.value })}
            >
              <option value="">Select a judge</option>
              {judges.map((j) => (
                <option key={j._id} value={j._id}>{j.name} ({j.email})</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" type="submit">Assign judge</button>
        </form>
      </div>

      {teams.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Teams overview</div>
          </div>
          <ul className="member-list">
            {teams.map((t) => (
              <li className="member-item" key={t._id}>
                <span className="member-avatar">{t.name.charAt(0).toUpperCase()}</span>
                {t.name}
                <span className="leader-badge">
                  {t.assignedJudges.length > 0 ? `${t.assignedJudges.length} judge(s)` : "No judge yet"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
    </>
  );
}

/* ---------------- Announcements Page ---------------- */
function AnnouncementsPage({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", message: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/announcements`, authHeader);
      setAnnouncements(res.data);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePost = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      await axios.post(`${API_URL}/announcements`, form, authHeader);
      setMessage({ type: "success", text: "Announcement posted." });
      setForm({ title: "", message: "" });
      fetchAnnouncements();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Could not post announcement" });
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  if (loading) return null;

  return (
    <>
      <div className="page-eyebrow">06 · Updates</div>
      <div className="page-title">Announcements</div>
      <div className="page-subtitle">Stay up to date with the latest from the organizers.</div>

      {user.role === "admin" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Post an announcement</div>
          </div>
          <form onSubmit={handlePost}>
            <div className="field">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} required />
            </div>
            <button className="btn-primary" type="submit">Post announcement</button>
          </form>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">$ _</div>
            <p>No announcements yet. Check back soon.</p>
          </div>
        </div>
      ) : (
        announcements.map((a) => (
          <div className="card" key={a._id}>
            <div className="card-header">
              <div className="card-title">{a.title}</div>
              <span className="leader-badge">{formatDate(a.createdAt)}</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{a.message}</p>
          </div>
        ))
      )}

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
    </>
  );
}

export default App;
