import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CountdownTimer from "../components/CountdownTimer";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Award,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
} from "lucide-react";

export default function HackathonDetail({ hackathonId, setPage, onOpenAuth }) {
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  useEffect(() => {
    if (!hackathonId) return;

    setLoading(true);
    api
      .get(`/hackathons/${hackathonId}`)
      .then((res) => {
        setHackathon(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Load leaderboard
    api
      .get(`/hackathons/${hackathonId}/leaderboard`)
      .then((res) => {
        setLeaderboard(res.data.leaderboard || []);
      })
      .catch((err) => console.error(err));
  }, [hackathonId]);

  const handleCreateTeamRegister = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setRegError("");
    setRegSuccess("");

    if (!teamName.trim()) {
      setRegError("Please enter a team name.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post("/teams", {
        name: teamName.trim(),
        hackathonId: hackathon._id,
      });

      setRegSuccess(`Team "${res.data.name}" created! Invite code: ${res.data.inviteCode}`);
      setTimeout(() => {
        setShowRegModal(false);
        setPage("dashboard");
      }, 1500);
    } catch (err) {
      setRegError(err.response?.data?.message || "Failed to register team.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="section-container text-center py-20">
        <h2>Hackathon Not Found</h2>
        <button className="btn-hero-secondary mt-4" onClick={() => setPage("hackathons")}>
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="hackathon-detail-page">
      {/* Banner Hero */}
      <div className="detail-hero-banner">
        <img src={hackathon.bannerImage} alt={hackathon.title} className="hero-bg-img" />
        <div className="hero-banner-overlay"></div>

        <div className="section-container detail-hero-content">
          <div className="detail-tags-row">
            <span className={`mode-badge mode-${hackathon.mode?.toLowerCase()}`}>{hackathon.mode}</span>
            <StatusBadge status={hackathon.status} />
            <span className="theme-tag">{hackathon.theme}</span>
          </div>

          <h1 className="detail-title">{hackathon.title}</h1>
          <p className="detail-tagline">{hackathon.tagline || hackathon.description?.substring(0, 150)}</p>

          <div className="detail-meta-grid">
            <div className="meta-card">
              <Trophy className="meta-icon gold" />
              <div>
                <span className="meta-label">Prize Pool</span>
                <span className="meta-value">{hackathon.prizePool}</span>
              </div>
            </div>

            <div className="meta-card">
              <MapPin className="meta-icon cyan" />
              <div>
                <span className="meta-label">Venue / Format</span>
                <span className="meta-value">{hackathon.venue}</span>
              </div>
            </div>

            <div className="meta-card">
              <Users className="meta-icon violet" />
              <div>
                <span className="meta-label">Team Constraints</span>
                <span className="meta-value">1 - {hackathon.maxTeamSize} Members</span>
              </div>
            </div>
          </div>

          <div className="detail-cta-row">
            <CountdownTimer targetDate={hackathon.registrationDeadline} label="Registration Closes" />

            {user ? (
              user.role === "participant" ? (
                <button
                  className="btn-primary-glow lg"
                  disabled={!hackathon.registrationOpen || submitting}
                  onClick={() => setShowRegModal(true)}
                >
                  <Plus className="btn-icon" /> Register My Team
                </button>
              ) : (
                <div className="role-notice-pill">
                  Logged in as <strong className="text-violet">{user.role}</strong>
                </div>
              )
            ) : (
              <button className="btn-primary-glow lg" onClick={onOpenAuth}>
                Sign In to Register
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detail Navigation Tabs */}
      <div className="detail-tabs-bar">
        <div className="section-container flex gap-4">
          <button
            className={`detail-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview & Rules
          </button>
          <button
            className={`detail-tab ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => setActiveTab("leaderboard")}
          >
            Live Leaderboard ({leaderboard.length})
          </button>
        </div>
      </div>

      {/* Main Tab Body */}
      <div className="section-container py-10">
        {activeTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6">
                <h3 className="section-subtitle mb-4">About this Hackathon</h3>
                <p className="whitespace-pre-line text-gray-300 leading-relaxed">{hackathon.description}</p>
              </div>

              {hackathon.rules && (
                <div className="glass-panel p-6">
                  <h3 className="section-subtitle mb-4">Rules & Guidelines</h3>
                  <p className="whitespace-pre-line text-gray-300 leading-relaxed">{hackathon.rules}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6">
                <h4 className="font-bold text-white mb-4">Important Schedule</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-cyan" />
                    <div>
                      <div className="text-gray-400 text-xs">Event Start</div>
                      <div className="text-white font-semibold">
                        {new Date(hackathon.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-gray-400 text-xs">Submission Deadline</div>
                      <div className="text-white font-semibold">
                        {new Date(hackathon.submissionDeadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Leaderboard Tab */
          <div className="glass-panel p-6">
            <h3 className="section-subtitle mb-4">Official Rankings</h3>
            {leaderboard.length === 0 ? (
              <p className="text-gray-400">Leaderboard has not been published for this hackathon yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team Name</th>
                      <th>Project Title</th>
                      <th>Tech Stack</th>
                      <th>Total Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item) => (
                      <tr key={item.teamId} className={item.rank <= 3 ? "top-rank-row" : ""}>
                        <td>
                          <span className={`rank-pill rank-${item.rank}`}>#{item.rank}</span>
                        </td>
                        <td className="font-semibold text-white">{item.teamName}</td>
                        <td>{item.submission?.title || "Draft"}</td>
                        <td>
                          <div className="tech-pills-row">
                            {(item.submission?.techStack || []).slice(0, 3).map((t, idx) => (
                              <span key={idx} className="tech-pill-xs">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="score-badge-highlight">{item.totalScore} / 70</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <Modal isOpen={showRegModal} onClose={() => !submitting && setShowRegModal(false)} title="Register Team for Hackathon">
        <form onSubmit={handleCreateTeamRegister} className="modal-form">
          <div className="form-group">
            <label>Team Name</label>
            <input
              type="text"
              placeholder="e.g. Cyber Knights"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          {regError && <div className="auth-error-alert">{regError}</div>}
          {regSuccess && <div className="auth-success-alert">{regSuccess}</div>}

          <button type="submit" className="btn-primary-glow w-full mt-4 flex items-center justify-center gap-2" disabled={submitting}>
            {submitting ? (
              <>
                <span className="btn-spinner-sm"></span>
                <span>Creating Team...</span>
              </>
            ) : (
              <span>Confirm & Create Team</span>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
