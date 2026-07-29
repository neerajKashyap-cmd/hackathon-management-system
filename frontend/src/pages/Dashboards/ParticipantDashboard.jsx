import { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import CertificateModal from "../../components/CertificateModal";
import {
  Users,
  Code,
  Trophy,
  Plus,
  Key,
  LogOut,
  Trash2,
  Edit,
  ExternalLink,
  GitBranch,
  Award,
  CheckCircle,
  FileCheck,
  Lock,
  Layers,
} from "lucide-react";

export default function ParticipantDashboard({ setPage, setSelectedHackathon }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loading, setLoading] = useState(true);

  // Join Team Modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joinMsg, setJoinMsg] = useState("");

  // Submit Project Form Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [subForm, setSubForm] = useState({
    title: "",
    problemStatement: "",
    solution: "",
    description: "",
    repoLink: "",
    demoLink: "",
    techStack: "",
    demoVideoLink: "",
    presentationPdf: "",
  });
  const [subError, setSubError] = useState("");

  // Certificate Modal
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    fetchParticipantData();
  }, []);

  const fetchParticipantData = () => {
    setLoading(true);
    // Load my teams & my submissions
    Promise.all([api.get("/teams/my"), api.get("/submissions/my")])
      .then(([teamsRes, subsRes]) => {
        setTeams(teamsRes.data || []);
        const loadedSubmissions = Array.isArray(subsRes.data)
          ? subsRes.data
          : subsRes.data
          ? [subsRes.data]
          : [];
        setSubmissions(loadedSubmissions);

        if (teamsRes.data && teamsRes.data.length > 0) {
          setSelectedTeamId(teamsRes.data[0]._id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const activeTeam = teams.find((t) => t._id === selectedTeamId) || teams[0] || null;
  const activeSubmission = activeTeam
    ? submissions.find(
        (s) =>
          (typeof s.team === "string" ? s.team : s.team?._id) === activeTeam._id ||
          (s.hackathon && s.hackathon._id === activeTeam.hackathon?._id)
      ) || null
    : null;

  useEffect(() => {
    if (activeSubmission) {
      setSubForm({
        title: activeSubmission.title || "",
        problemStatement: activeSubmission.problemStatement || "",
        solution: activeSubmission.solution || "",
        description: activeSubmission.description || "",
        repoLink: activeSubmission.repoLink || "",
        demoLink: activeSubmission.demoLink || "",
        techStack: (activeSubmission.techStack || []).join(", "),
        demoVideoLink: activeSubmission.demoVideoLink || "",
        presentationPdf: activeSubmission.presentationPdf || "",
      });
    } else {
      setSubForm({
        title: "",
        problemStatement: "",
        solution: "",
        description: "",
        repoLink: "",
        demoLink: "",
        techStack: "",
        demoVideoLink: "",
        presentationPdf: "",
      });
    }
  }, [selectedTeamId, activeSubmission]);

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setJoinMsg("");
    try {
      await api.post("/teams/join", { inviteCode });
      setShowJoinModal(false);
      setInviteCode("");
      fetchParticipantData();
    } catch (err) {
      setJoinMsg(err.response?.data?.message || "Failed to join team.");
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setSubError("");
    if (!activeTeam) return;
    try {
      await api.post("/submissions", {
        teamId: activeTeam._id,
        ...subForm,
      });
      setShowSubmitModal(false);
      fetchParticipantData();
    } catch (err) {
      setSubError(err.response?.data?.message || "Error submitting project.");
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    try {
      await api.post(`/teams/${teamId}/leave`);
      fetchParticipantData();
    } catch (err) {
      alert(err.response?.data?.message || "Error leaving team.");
    }
  };

  const isResultsPublished =
    activeTeam?.hackathon?.resultsPublished ||
    activeTeam?.hackathon?.status === "completed" ||
    activeSubmission?.hackathon?.resultsPublished;

  return (
    <div className="section-container participant-dashboard-page">
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="section-badge"><Users className="badge-icon" /> PARTICIPANT PORTAL</span>
          <h1 className="page-title">Developer Workspace</h1>
          <p className="page-subtitle">
            Manage your team, track submission deadlines, and verify your results.
          </p>
        </div>

        <div className="header-actions flex items-center gap-3">
          <button className="btn-secondary-glow" onClick={() => setShowJoinModal(true)}>
            <Key className="btn-icon" /> Join via Invite Code
          </button>
        </div>
      </div>

      {/* Multi-Hackathon Workspace Switcher Banner */}
      {teams.length > 1 && (
        <div className="workspace-switcher-banner mb-6">
          <div className="switcher-header">
            <Layers className="switcher-icon" />
            <span className="switcher-title">SELECT HACKATHON WORKSPACE ({teams.length} REGISTERED)</span>
            <span className="text-xs text-gray-400 ml-2">— Click a button below to manage that team & project submission:</span>
          </div>

          <div className="workspace-tabs-row">
            {teams.map((t) => {
              const isSelected = selectedTeamId === t._id;
              return (
                <button
                  key={t._id}
                  className={`workspace-tab-btn ${isSelected ? "active" : ""}`}
                  onClick={() => setSelectedTeamId(t._id)}
                  title={`Switch workspace to ${t.hackathon?.title || t.name}`}
                >
                  <Trophy className="tab-trophy-icon" />
                  <div className="tab-text-box">
                    <span className="tab-hackathon-name">{t.hackathon?.title || "Hackathon"}</span>
                    <span className="tab-team-name">Team: {t.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="dashboard-grid-layout">
          {/* Left Column: Team Status Card */}
          <div className="dashboard-col">
            <div className="card-glass-panel">
              <h3 className="panel-title"><Users className="title-icon" /> Active Team Details</h3>

              {!activeTeam ? (
                <div className="empty-state-card py-8">
                  <Users className="empty-icon" />
                  <h4>Not in a Team Yet</h4>
                  <p>Browse hackathons to register a new team or join an existing team via code.</p>
                  <button className="btn-primary-glow sm mt-4" onClick={() => setPage("hackathons")}>
                    Browse Hackathons
                  </button>
                </div>
              ) : (
                <div className="team-details-box">
                  <div className="team-header-row">
                    <div>
                      <h2 className="team-name-lg">{activeTeam.name}</h2>
                      <span className="hackathon-tag-text">
                        Registered for: <strong>{activeTeam.hackathon?.title || "Hackathon"}</strong>
                      </span>
                    </div>
                    <StatusBadge status={activeTeam.status || "pending"} />
                  </div>

                  {/* Invite Code Box */}
                  <div className="invite-code-card">
                    <div className="invite-code-header">
                      <Key className="code-icon" />
                      <div>
                        <span className="code-label">Team Invite Code: </span>
                        <strong className="code-val">{activeTeam.inviteCode}</strong>
                      </div>
                    </div>
                    <span className="code-hint">Share this code with teammates to join your team</span>
                  </div>

                  {/* Members List */}
                  <h4 className="members-title">Team Roster ({activeTeam.members?.length || 1})</h4>
                  <div className="members-list">
                    {(activeTeam.members || []).map((m) => (
                      <div key={m._id} className="member-row">
                        <img src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`} alt={m.name} className="user-avatar-sm" />
                        <div className="member-info">
                          <span className="member-name">{m.name}</span>
                          <span className="member-email">{m.email}</span>
                        </div>
                        {activeTeam.leader?._id === m._id && <span className="leader-pill">LEADER</span>}
                      </div>
                    ))}
                  </div>

                  <div className="team-card-footer">
                    <button className="btn-secondary-danger" onClick={() => handleLeaveTeam(activeTeam._id)}>
                      <LogOut className="btn-icon" /> Leave Team
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Submission Tracker */}
          <div className="dashboard-col">
            <div className="card-glass-panel">
              <div className="panel-header-row">
                <h3 className="panel-title"><Code className="title-icon" /> Project Submission</h3>
                {activeTeam && (
                  isResultsPublished ? (
                    <span className="badge-warning font-mono text-xs px-3 py-1 rounded-full font-bold">
                      🔒 Submissions Locked (Results Announced)
                    </span>
                  ) : (
                    <button className="btn-primary-glow sm" onClick={() => setShowSubmitModal(true)}>
                      {activeSubmission ? <Edit className="btn-icon" /> : <Plus className="btn-icon" />}
                      {activeSubmission ? "Edit Project" : "Submit Project"}
                    </button>
                  )
                )}
              </div>

              {!activeSubmission ? (
                <div className="empty-state-card py-8">
                  <Code className="empty-icon" />
                  <h4>No Project Submitted</h4>
                  <p>Submit your GitHub repository, live demo link, and project details before the deadline.</p>
                </div>
              ) : (
                <div className="submission-preview-card">
                  <div className="sub-header-row">
                    <h3 className="sub-title">{activeSubmission.title}</h3>
                    {isResultsPublished ? (
                      <span className="badge-success font-mono text-xs px-3 py-1 rounded-full font-bold">
                        ✔ EVALUATED & VERIFIED
                      </span>
                    ) : (
                      <StatusBadge status={activeSubmission.status || "pending"} />
                    )}
                  </div>

                  <p className="sub-desc">{activeSubmission.description}</p>

                  <div className="sub-links-row">
                    {activeSubmission.repoLink && (
                      <a href={activeSubmission.repoLink} target="_blank" rel="noreferrer" className="sub-link-btn">
                        <GitBranch className="btn-icon" /> Repository
                      </a>
                    )}
                    {activeSubmission.demoLink && (
                      <a href={activeSubmission.demoLink} target="_blank" rel="noreferrer" className="sub-link-btn text-cyan">
                        <ExternalLink className="btn-icon" /> Live Demo
                      </a>
                    )}
                  </div>

                  {/* Certificate button - Only available AFTER results are published */}
                  {isResultsPublished ? (
                    <div className="cert-claim-box mt-6">
                      <FileCheck className="claim-icon text-gold" />
                      <div>
                        <h4>Digital Verification Certificate</h4>
                        <p>Official hackathon results are published! View and print your certificate.</p>
                      </div>
                      <button className="btn-primary-glow sm" onClick={() => setShowCertModal(true)}>
                        View Certificate
                      </button>
                    </div>
                  ) : (
                    <div className="cert-claim-box mt-6 opacity-75">
                      <Lock className="claim-icon text-amber-500" />
                      <div>
                        <h4>Digital Verification Certificate</h4>
                        <p className="text-xs text-amber-400 font-semibold">
                          ⌛ Certificate locked. Available after the organizer announces final results.
                        </p>
                      </div>
                      <button className="btn-hero-secondary sm opacity-60" disabled title="Certificate will unlock once results are published">
                        Locked
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join Team with Invite Code">
        <form onSubmit={handleJoinTeam} className="modal-form">
          <div className="form-group">
            <label>Invite Code</label>
            <input
              type="text"
              placeholder="e.g. NEURAL"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
          </div>
          {joinMsg && <div className="auth-error-alert">{joinMsg}</div>}
          <button type="submit" className="btn-primary-glow w-full mt-4">
            Join Team
          </button>
        </form>
      </Modal>

      {/* Submission Form Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title={activeSubmission ? "Edit Project Submission" : "Submit Hackathon Project"}>
        <form onSubmit={handleSubmitProject} className="modal-form">
          <div className="form-group">
            <label>Project Name / Title</label>
            <input type="text" value={subForm.title} onChange={(e) => setSubForm({ ...subForm, title: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>GitHub Repository URL</label>
            <input type="url" value={subForm.repoLink} onChange={(e) => setSubForm({ ...subForm, repoLink: e.target.value })} placeholder="https://github.com/..." required />
          </div>

          <div className="form-group">
            <label>Live Demo URL</label>
            <input type="url" value={subForm.demoLink} onChange={(e) => setSubForm({ ...subForm, demoLink: e.target.value })} placeholder="https://..." />
          </div>

          <div className="form-group">
            <label>Problem Statement</label>
            <textarea rows={2} value={subForm.problemStatement} onChange={(e) => setSubForm({ ...subForm, problemStatement: e.target.value })}></textarea>
          </div>

          <div className="form-group">
            <label>Solution & Features</label>
            <textarea rows={2} value={subForm.solution} onChange={(e) => setSubForm({ ...subForm, solution: e.target.value })}></textarea>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} required></textarea>
          </div>

          <div className="form-group">
            <label>Tech Stack (Comma-separated)</label>
            <input type="text" value={subForm.techStack} onChange={(e) => setSubForm({ ...subForm, techStack: e.target.value })} placeholder="React, Node.js, Express, MongoDB" />
          </div>

          {subError && <div className="auth-error-alert">{subError}</div>}

          <button type="submit" className="btn-primary-glow w-full mt-4">
            {activeSubmission ? "Save Submission Changes" : "Submit Project Now"}
          </button>
        </form>
      </Modal>

      {/* Certificate Modal */}
      {showCertModal && (
        <CertificateModal
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
          recipientName={user?.name}
          hackathonTitle={activeTeam?.hackathon?.title || "HackSphere 2026 Innovation Challenge"}
          teamName={activeTeam?.name}
        />
      )}
    </div>
  );
}
