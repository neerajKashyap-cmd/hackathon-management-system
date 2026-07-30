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
  CheckCircle,
  Clock,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Award,
  Video,
  FileText,
  Lock,
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
        setTeams(res.data);
        if (res.data.length > 0 && !selectedTeamId) {
          setSelectedTeamId(res.data[0]._id);
        }
      })
      .catch((err) => console.error(err))
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
          <span className="switcher-label">Active Workspace:</span>
          <div className="workspace-tabs-scroll">
            {teams.map((t) => (
              <button
                key={t._id}
                className={`workspace-tab-btn ${t._id === activeTeam?._id ? "active" : ""}`}
                onClick={() => setSelectedTeamId(t._id)}
              >
                <span className="tab-team-name">{t.name}</span>
                <span className="tab-hackathon-name">({t.hackathon?.title})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner-container py-12">
          <div className="spinner"></div>
        </div>
      ) : teams.length === 0 ? (
        <div className="empty-state-card text-center py-12">
          <Code className="empty-icon mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">You are not registered in any hackathon teams yet.</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Browse live hackathons to register a new team or enter a 6-character team invite code provided by your teammate.
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn-primary-glow" onClick={() => setPage("hackathons")}>
              Browse Directory
            </button>
            <button className="btn-secondary-glow" onClick={() => setShowJoinModal(true)}>
              Join Team with Code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Team Roster & Project Submission Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Roster Card */}
            <div className="card-glass-panel">
              <div className="panel-header-row">
                <div>
                  <span className="text-xs font-mono text-cyan font-bold">HACKATHON: {activeTeam?.hackathon?.title}</span>
                  <h3 className="panel-title text-xl font-bold text-white flex items-center gap-2 mt-1">
                    {activeTeam?.name}
                    <StatusBadge status={activeTeam?.status || "pending"} />
                  </h3>
                </div>

                <button className="btn-secondary-danger btn-sm" onClick={() => handleLeaveTeam(activeTeam._id)}>
                  <LogOut className="btn-icon" /> Leave Team
                </button>
              </div>

              {/* Invite Code Box */}
              <div className="invite-code-card my-4 p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Team Secret Invite Code</div>
                  <div className="font-mono text-xl font-extrabold text-cyan tracking-widest mt-1">
                    {activeTeam?.inviteCode}
                  </div>
                </div>

                <button
                  className="btn-secondary-glow btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(activeTeam?.inviteCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check className="btn-icon text-emerald-400" /> : <Copy className="btn-icon" />}
                  {copied ? "Copied Code!" : "Copy Code"}
                </button>
              </div>

              {/* Roster Members */}
              <div className="mt-4">
                <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan" /> Team Roster ({activeTeam?.members?.length || 1} Members)
                </h4>

                <div className="members-list space-y-2">
                  {activeTeam?.members?.map((m) => {
                    const isLeader = m._id === activeTeam?.leader?._id || m._id === activeTeam?.leader;
                    return (
                      <div key={m._id} className="member-row flex items-center justify-between p-3 rounded-lg bg-gray-950/40 border border-gray-800/60">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`}
                            alt={m.name}
                            className="w-8 h-8 rounded-full border border-cyan/40"
                          />
                          <div>
                            <div className="font-bold text-sm text-white flex items-center gap-2">
                              {m.name}
                              {isLeader && <span className="badge-role-organizer text-2xs">TEAM LEADER</span>}
                            </div>
                            <div className="text-xs text-gray-400">{m.email}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submission Section */}
            <div className="card-glass-panel">
              <div className="panel-header-row">
                <div>
                  <h3 className="panel-title"><Code className="title-icon text-cyan" /> Project Submission</h3>
                  <p className="text-xs text-gray-400 mt-1">Submit your repository link, demo URL, presentation, and tech stack details.</p>
                </div>

                {isResultsPublished ? (
                  <button className="btn-disabled-locked sm" disabled>
                    <Lock className="btn-icon" /> Submissions Locked (Results Announced)
                  </button>
                ) : (
                  <button className="btn-primary-glow sm" onClick={() => setShowSubmitModal(true)}>
                    <Send className="btn-icon" /> {activeSubmission ? "Edit Submission" : "Submit Project"}
                  </button>
                )}
              </div>

              {activeSubmission ? (
                <div className="submission-details-box mt-4 p-5 rounded-xl bg-gray-900/40 border border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-white">{activeSubmission.title}</h4>
                    <StatusBadge status={activeSubmission.status || "submitted"} />
                  </div>

                  <p className="text-sm text-gray-300 mb-4">{activeSubmission.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    {activeSubmission.githubRepo && (
                      <a href={activeSubmission.githubRepo} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-cyan hover:underline p-2 rounded bg-gray-950/60 border border-gray-800">
                        <Code className="w-4 h-4" /> GitHub Repository <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    )}
                    {activeSubmission.demoUrl && (
                      <a href={activeSubmission.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-400 hover:underline p-2 rounded bg-gray-950/60 border border-gray-800">
                        <ExternalLink className="w-4 h-4" /> Live Web Application <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="empty-submission-placeholder text-center py-8 bg-gray-950/30 rounded-xl border border-dashed border-gray-800 my-4">
                  <Clock className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No project submitted yet for this hackathon.</p>
                  <p className="text-xs text-gray-500 mt-1">Make sure to submit before the deadline!</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Event Overview & Results Panel */}
          <div className="space-y-6">
            <div className="card-glass-panel">
              <h3 className="panel-title"><Award className="title-icon text-amber-400" /> Event Status & Results</h3>

              {activeTeam?.hackathon?.resultsPublished ? (
                <div className="published-results-banner p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mt-4 text-center">
                  <Award className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                  <h4 className="font-bold text-amber-300 text-lg">Winners Announced!</h4>
                  <p className="text-xs text-gray-300 mt-1">Official scores and leaderboard rankings have been published by the organizer.</p>
                  <button className="btn-primary-glow btn-sm mt-3 w-full" onClick={() => setPage("leaderboard")}>
                    View Winner Leaderboard
                  </button>
                </div>
              ) : (
                <div className="pending-results-box p-4 rounded-xl bg-gray-900/50 border border-gray-800 mt-4 text-center">
                  <Clock className="w-10 h-10 text-cyan mx-auto mb-2" />
                  <h4 className="font-bold text-gray-200">Judging In Progress</h4>
                  <p className="text-xs text-gray-400 mt-1">Results and leaderboard will be visible here once the organizer publishes final scores.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      <Modal isOpen={showJoinModal} onClose={() => !submitting && setShowJoinModal(false)} title="Join Team via Secret Code">
        <form onSubmit={handleJoinTeam} className="modal-form">
          {joinMsg && <div className="auth-error-alert">{joinMsg}</div>}
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
        <form onSubmit={handleSubmitProject} className="modal-form">
          {subError && <div className="auth-error-alert">{subError}</div>}

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
