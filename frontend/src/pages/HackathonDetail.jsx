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
    setRegError("");
    setRegSuccess("");

    if (!teamName) {
      setRegError("Please enter a team name.");
      return;
    }

    try {
      const res = await api.post("/teams", {
        name: teamName,
        hackathonId: hackathon._id,
      });

      setRegSuccess(`Team "${res.data.name}" created! Invite code: ${res.data.inviteCode}`);
      setTimeout(() => {
        setShowRegModal(false);
        setPage("dashboard");
      }, 2000);
    } catch (err) {
      setRegError(err.response?.data?.message || "Failed to register team.");
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
                  disabled={!hackathon.registrationOpen}
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

      {/* Tabs Bar */}
      <div className="detail-tabs-bar">
        <div className="section-container detail-tabs-flex">
          <button
            className={`detail-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview & Description
          </button>
          <button
            className={`detail-tab ${activeTab === "rules" ? "active" : ""}`}
            onClick={() => setActiveTab("rules")}
          >
            Rules & Schedule
          </button>
          <button
            className={`detail-tab ${activeTab === "criteria" ? "active" : ""}`}
            onClick={() => setActiveTab("criteria")}
          >
            Judging Criteria
          </button>
          <button
            className={`detail-tab ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => setActiveTab("leaderboard")}
          >
            Live Leaderboard ({leaderboard.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="section-container detail-content-container">
        {activeTab === "overview" && (
          <div className="tab-pane">
            <h3 className="pane-title">About the Hackathon</h3>
            <p className="pane-paragraph">{hackathon.description}</p>

            <div className="organizer-info-card">
              <img
                src={hackathon.organizer?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=Org`}
                alt="Organizer"
                className="org-avatar"
              />
              <div>
                <span className="org-label">Hosted & Managed By</span>
                <h4 className="org-name">{hackathon.organizer?.name || "Official Hackathon Director"}</h4>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="tab-pane">
            <h3 className="pane-title">Rules & Conduct</h3>
            <pre className="rules-pre">{hackathon.rules || "No custom rules posted yet."}</pre>

            <h3 className="pane-title mt-8">Deadlines Timeline</h3>
            <div className="timeline-grid">
              <div className="timeline-card">
                <Clock className="timeline-icon" />
                <div>
                  <span className="timeline-label">Registration Deadline</span>
                  <span className="timeline-val">{new Date(hackathon.registrationDeadline).toLocaleString()}</span>
                </div>
              </div>
              <div className="timeline-card">
                <Clock className="timeline-icon text-cyan" />
                <div>
                  <span className="timeline-label">Submission Deadline</span>
                  <span className="timeline-val">{new Date(hackathon.submissionDeadline).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "criteria" && (
          <div className="tab-pane">
            <h3 className="pane-title">7-Criteria Evaluation Scorecard</h3>
            <p className="pane-paragraph">
              All submitted projects will be reviewed by assigned expert judges across the following standardized weighted dimensions:
            </p>

            <div className="criteria-grid">
              {(hackathon.judgingCriteria || []).map((crit, i) => (
                <div key={i} className="criteria-card">
                  <div className="criteria-header">
                    <span className="crit-name">{crit.name}</span>
                    <span className="crit-max">{crit.maxScore} Marks</span>
                  </div>
                  <div className="crit-progress-bar">
                    <div className="progress-fill" style={{ width: "100%" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="tab-pane">
            <h3 className="pane-title">Live Hackathon Leaderboard</h3>

            {leaderboard.length === 0 ? (
              <div className="empty-state-card">
                <Trophy className="empty-icon" />
                <h4>No Scores Published Yet</h4>
                <p>Judges are currently reviewing team submissions.</p>
              </div>
            ) : (
              <div className="leaderboard-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team Name</th>
                      <th>Submission Project</th>
                      <th>Tech Stack</th>
                      <th>Avg Total Score</th>
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
      <Modal isOpen={showRegModal} onClose={() => setShowRegModal(false)} title="Register Team for Hackathon">
        <form onSubmit={handleCreateTeamRegister} className="modal-form">
          <div className="form-group">
            <label>Team Name</label>
            <input
              type="text"
              placeholder="e.g. Cyber Knights"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>

          {regError && <div className="auth-error-alert">{regError}</div>}
          {regSuccess && <div className="auth-success-alert">{regSuccess}</div>}

          <button type="submit" className="btn-primary-glow w-full mt-4">
            Create Team & Register
          </button>
        </form>
      </Modal>
    </div>
  );
}
