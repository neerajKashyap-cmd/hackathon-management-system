import { useState, useEffect } from "react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import {
  Users,
  Code,
  Send,
  UserPlus,
  Key,
  Copy,
  Check,
  Clock,
  LogOut,
  Sparkles,
  ExternalLink,
  Award,
  Lock,
  Layers,
  Zap,
} from "lucide-react";

export default function ParticipantDashboard({ setPage, setSelectedHackathon }) {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joinMsg, setJoinMsg] = useState("");

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

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchParticipantData();
  }, []);

  const fetchParticipantData = () => {
    setLoading(true);
    api
      .get("/teams/my-teams")
      .then((res) => {
        const teamList = Array.isArray(res.data) ? res.data : [];
        setTeams(teamList);
        if (teamList.length > 0) {
          setSelectedTeamId((prev) => (prev && teamList.some((t) => t._id === prev) ? prev : teamList[0]._id));
        }
      })
      .catch((err) => console.error("Error loading participant teams:", err))
      .finally(() => setLoading(false));
  };

  const activeTeam = teams.find((t) => t._id === selectedTeamId) || teams[0];
  const activeSubmission = activeTeam?.submission;

  useEffect(() => {
    if (activeSubmission) {
      setSubForm({
        title: activeSubmission.title || "",
        problemStatement: activeSubmission.problemStatement || "",
        solution: activeSubmission.solution || "",
        description: activeSubmission.description || "",
        repoLink: activeSubmission.githubRepo || "",
        demoLink: activeSubmission.demoUrl || "",
        techStack: Array.isArray(activeSubmission.techStack)
          ? activeSubmission.techStack.join(", ")
          : activeSubmission.techStack || "",
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
    if (submitting) return;

    setSubmitting(true);
    setJoinMsg("");
    try {
      await api.post("/teams/join", { inviteCode });
      setShowJoinModal(false);
      setInviteCode("");
      fetchParticipantData();
    } catch (err) {
      setJoinMsg(err.response?.data?.message || "Failed to join team.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (submitting || !activeTeam) return;

    setSubmitting(true);
    setSubError("");
    try {
      await api.post("/submissions", {
        teamId: activeTeam._id,
        ...subForm,
      });
      setShowSubmitModal(false);
      fetchParticipantData();
    } catch (err) {
      setSubError(err.response?.data?.message || "Error submitting project.");
    } finally {
      setSubmitting(false);
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

  const totalSubmissions = teams.filter((t) => t.submission).length;

  return (
    <div className="participant-dashboard-container pb-16">
      {/* Header Bar */}
      <div className="dashboard-header-bar">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-badge"><Users className="badge-icon" /> PARTICIPANT PORTAL</span>
          </div>
          <h1 className="page-title text-2xl font-bold text-white">Developer Workspace</h1>
          <p className="text-sm text-gray-400">
            Manage your registered hackathons, submit project code, and view live results.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-secondary-glow btn-sm flex items-center gap-1.5" onClick={() => setShowJoinModal(true)}>
            <Key className="w-4 h-4 text-cyan" /> Join Team via Code
          </button>
          <button className="btn-primary-glow btn-sm flex items-center gap-1.5" onClick={() => setPage("hackathons")}>
            <Zap className="w-4 h-4" /> Browse Hackathons
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="participant-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-label">Registered Events</div>
          <div className="dash-stat-value">{teams.length}</div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-label">Active Submissions</div>
          <div className="dash-stat-value cyan">{totalSubmissions} / {teams.length}</div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-label">Current Team</div>
          <div className="dash-stat-value purple text-lg truncate">{activeTeam ? activeTeam.name : "None"}</div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-label">Registration Status</div>
          <div className="text-sm font-bold text-emerald-400 capitalize mt-1">
            {activeTeam?.status ? activeTeam.status.toUpperCase() : "ACTIVE"}
          </div>
        </div>
      </div>

      {/* Workspace Switcher Tabs */}
      {teams.length > 1 && (
        <div className="dash-card-box mb-6 py-3 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1 shrink-0">
            <Layers className="w-4 h-4 text-cyan" /> Switch Hackathon:
          </span>
          <div className="flex gap-2">
            {teams.map((t) => {
              const isActive = t._id === activeTeam?._id;
              return (
                <button
                  key={t._id}
                  onClick={() => setSelectedTeamId(t._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-cyan-600 text-white border border-cyan-400"
                      : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="opacity-60 text-2xs">({t.hackathon?.title || "Hackathon"})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner-container py-16">
          <div className="spinner"></div>
        </div>
      ) : teams.length === 0 ? (
        <div className="dash-card-box p-12 text-center max-w-xl mx-auto">
          <Code className="w-12 h-12 text-cyan mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">No Registered Teams Yet</h3>
          <p className="text-sm text-gray-400 mb-6">
            You haven't joined or registered a team for any active hackathons.
          </p>
          <div className="flex justify-center gap-3">
            <button className="btn-primary-glow btn-sm" onClick={() => setPage("hackathons")}>
              Browse Hackathons
            </button>
            <button className="btn-secondary-glow btn-sm" onClick={() => setShowJoinModal(true)}>
              Join Team with Code
            </button>
          </div>
        </div>
      ) : (
        <div className="participant-main-grid">
          {/* Column 1: Team Roster & Submissions */}
          <div className="space-y-6">
            {/* Team Roster Card */}
            <div className="dash-card-box">
              <div className="dash-card-header">
                <div>
                  <div className="text-2xs font-mono text-cyan font-bold uppercase tracking-wider mb-1">
                    EVENT: {activeTeam?.hackathon?.title || "Hackathon Event"}
                  </div>
                  <div className="dash-card-title">
                    <span>{activeTeam?.name}</span>
                    <StatusBadge status={activeTeam?.status || "pending"} />
                  </div>
                </div>

                <button
                  className="btn-secondary-danger btn-sm flex items-center gap-1"
                  onClick={() => handleLeaveTeam(activeTeam._id)}
                >
                  <LogOut className="w-3.5 h-3.5" /> Leave Team
                </button>
              </div>

              {/* Secret Invite Code Row */}
              <div className="invite-code-row">
                <div>
                  <div className="text-2xs font-bold text-gray-400 uppercase tracking-wider">Team Invite Code</div>
                  <div className="invite-code-text">{activeTeam?.inviteCode}</div>
                </div>

                <button
                  className="btn-secondary-glow btn-sm flex items-center gap-1.5"
                  onClick={() => {
                    navigator.clipboard.writeText(activeTeam?.inviteCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              {/* Roster Members List */}
              <div>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan" /> Team Roster ({activeTeam?.members?.length || 1} Members)
                </div>

                <div className="member-list-column">
                  {activeTeam?.members?.map((m) => {
                    const isLeader = m._id === activeTeam?.leader?._id || m._id === activeTeam?.leader;
                    return (
                      <div key={m._id} className="member-item-card">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.name)}`}
                            alt={m.name}
                            className="member-avatar-img"
                          />
                          <div>
                            <div className="member-name-text flex items-center gap-2">
                              <span>{m.name}</span>
                              {isLeader && (
                                <span className="badge-role-organizer text-3xs">TEAM LEADER</span>
                              )}
                            </div>
                            <div className="member-email-text">{m.email}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submission Section */}
            <div className="dash-card-box">
              <div className="dash-card-header">
                <div>
                  <div className="dash-card-title">
                    <Code className="w-5 h-5 text-cyan" /> Project Submission
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Submit repository URL and live demo details.</p>
                </div>

                {isResultsPublished ? (
                  <button className="btn-disabled-locked btn-sm" disabled>
                    <Lock className="w-3.5 h-3.5" /> Submissions Locked
                  </button>
                ) : (
                  <button className="btn-primary-glow btn-sm flex items-center gap-1.5" onClick={() => setShowSubmitModal(true)}>
                    <Send className="w-3.5 h-3.5" /> {activeSubmission ? "Edit Submission" : "Submit Project"}
                  </button>
                )}
              </div>

              {activeSubmission ? (
                <div className="p-4 rounded-xl bg-gray-950/60 border border-gray-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold text-white">{activeSubmission.title}</h4>
                    <StatusBadge status={activeSubmission.status || "submitted"} />
                  </div>

                  {activeSubmission.description && (
                    <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/60 p-2.5 rounded border border-gray-800">
                      {activeSubmission.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs font-mono pt-1">
                    {activeSubmission.githubRepo && (
                      <a href={activeSubmission.githubRepo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-cyan hover:underline p-2 rounded bg-gray-900 border border-gray-800">
                        <Code className="w-3.5 h-3.5" /> GitHub Code <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {activeSubmission.demoUrl && (
                      <a href={activeSubmission.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-400 hover:underline p-2 rounded bg-gray-900 border border-gray-800">
                        <ExternalLink className="w-3.5 h-3.5" /> Live Demo <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-gray-950/40 rounded-xl border border-dashed border-gray-800">
                  <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No project submitted yet for this hackathon.</p>
                  <button className="btn-primary-glow btn-sm mt-3 inline-flex items-center gap-1.5" onClick={() => setShowSubmitModal(true)}>
                    <Send className="w-3.5 h-3.5" /> Submit Project Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Event Overview & Results Card */}
          <div className="space-y-6">
            <div className="dash-card-box">
              <div className="dash-card-title mb-4">
                <Award className="w-5 h-5 text-amber-400" /> Event Status & Results
              </div>

              {isResultsPublished ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <Award className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <h4 className="font-bold text-amber-300 text-base">Winners Announced!</h4>
                  <p className="text-xs text-gray-300 mt-1">Official scores and leaderboard rankings published.</p>
                  <button className="btn-primary-glow btn-sm mt-3 w-full" onClick={() => setPage("leaderboard")}>
                    View Leaderboard Rankings
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-950/60 border border-gray-800 text-center space-y-2 py-6">
                  <Clock className="w-8 h-8 text-cyan mx-auto mb-1" />
                  <h4 className="font-bold text-gray-200 text-sm">Evaluation In Progress</h4>
                  <p className="text-2xs text-gray-400 leading-relaxed">
                    Judges are evaluating submitted projects. Final scores will appear here once published.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      <Modal isOpen={showJoinModal} onClose={() => !submitting && setShowJoinModal(false)} title="Join Team via Secret Code">
        <form onSubmit={handleJoinTeam} className="modal-form">
          {joinMsg && <div className="auth-error-alert mb-4">{joinMsg}</div>}
          <div className="form-group">
            <label>6-Character Team Secret Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              className="text-center font-mono text-xl tracking-widest uppercase font-bold"
              required
              disabled={submitting}
            />
          </div>
          <button type="submit" className="btn-primary-glow w-full mt-4 flex items-center justify-center gap-2" disabled={submitting}>
            {submitting ? (
              <>
                <span className="btn-spinner-sm"></span>
                <span>Joining Team...</span>
              </>
            ) : (
              <span>Join Team Workspace</span>
            )}
          </button>
        </form>
      </Modal>

      {/* Submit / Edit Project Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => !submitting && setShowSubmitModal(false)} title={activeSubmission ? "Edit Project Submission" : "Submit Hackathon Project"}>
        <form onSubmit={handleSubmitProject} className="modal-form space-y-4">
          {subError && <div className="auth-error-alert mb-4">{subError}</div>}

          <div className="form-group">
            <label>Project Title</label>
            <input type="text" value={subForm.title} onChange={(e) => setSubForm({ ...subForm, title: e.target.value })} placeholder="Project Name..." required disabled={submitting} />
          </div>

          <div className="form-group">
            <label>Problem Statement</label>
            <textarea rows={2} value={subForm.problemStatement} onChange={(e) => setSubForm({ ...subForm, problemStatement: e.target.value })} placeholder="What problem does your project solve?" disabled={submitting}></textarea>
          </div>

          <div className="form-group">
            <label>Proposed Solution & Overview</label>
            <textarea rows={3} value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} placeholder="Describe how your app works..." required disabled={submitting}></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Code className="icon-inline" /> GitHub Repository Link</label>
              <input type="url" value={subForm.repoLink} onChange={(e) => setSubForm({ ...subForm, repoLink: e.target.value })} placeholder="https://github.com/..." required disabled={submitting} />
            </div>

            <div className="form-group">
              <label><ExternalLink className="icon-inline" /> Live Web Application Link</label>
              <input type="url" value={subForm.demoLink} onChange={(e) => setSubForm({ ...subForm, demoLink: e.target.value })} placeholder="https://my-app.vercel.app..." disabled={submitting} />
            </div>
          </div>

          <div className="form-group">
            <label>Technologies Used (Comma-separated)</label>
            <input type="text" value={subForm.techStack} onChange={(e) => setSubForm({ ...subForm, techStack: e.target.value })} placeholder="React, Node.js, MongoDB, Tailwind..." disabled={submitting} />
          </div>

          <button type="submit" className="btn-primary-glow w-full mt-4 flex items-center justify-center gap-2" disabled={submitting}>
            {submitting ? (
              <>
                <span className="btn-spinner-sm"></span>
                <span>Submitting Project...</span>
              </>
            ) : (
              <span>{activeSubmission ? "Update Submission" : "Submit Project"}</span>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
