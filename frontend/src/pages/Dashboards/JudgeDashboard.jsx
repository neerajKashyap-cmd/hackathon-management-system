import { useState, useEffect } from "react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import {
  Award,
  CheckCircle,
  Clock,
  ExternalLink,
  GitBranch,
  Star,
  Sliders,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function JudgeDashboard() {
  const [assignedItems, setAssignedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'pending' | 'scored'

  // Scoring Modal State
  const [activeItem, setActiveItem] = useState(null);
  const [scoreForm, setScoreForm] = useState({
    innovation: 8,
    technicalComplexity: 8,
    userInterface: 8,
    functionality: 8,
    scalability: 8,
    documentation: 8,
    presentation: 8,
    feedback: "",
  });
  const [scoreMsg, setScoreMsg] = useState("");

  useEffect(() => {
    fetchAssignedTeams();
  }, []);

  const fetchAssignedTeams = () => {
    setLoading(true);
    api
      .get("/judging/assigned-teams")
      .then((res) => setAssignedItems(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const openScoreModal = (item) => {
    setActiveItem(item);
    if (item.myScore) {
      setScoreForm({
        innovation: item.myScore.innovation || 0,
        technicalComplexity: item.myScore.technicalComplexity || 0,
        userInterface: item.myScore.userInterface || 0,
        functionality: item.myScore.functionality || 0,
        scalability: item.myScore.scalability || 0,
        documentation: item.myScore.documentation || 0,
        presentation: item.myScore.presentation || 0,
        feedback: item.myScore.feedback || "",
      });
    } else {
      setScoreForm({
        innovation: 7,
        technicalComplexity: 7,
        userInterface: 7,
        functionality: 7,
        scalability: 7,
        documentation: 7,
        presentation: 7,
        feedback: "",
      });
    }
  };

  const handleSliderChange = (field, val) => {
    setScoreForm((prev) => ({ ...prev, [field]: Number(val) }));
  };

  const calculateTotal = () => {
    return (
      (scoreForm.innovation || 0) +
      (scoreForm.technicalComplexity || 0) +
      (scoreForm.userInterface || 0) +
      (scoreForm.functionality || 0) +
      (scoreForm.scalability || 0) +
      (scoreForm.documentation || 0) +
      (scoreForm.presentation || 0)
    );
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!activeItem) return;
    setScoreMsg("");

    try {
      await api.post("/judging/score", {
        teamId: activeItem.team._id,
        hackathonId: activeItem.team.hackathon?._id,
        ...scoreForm,
      });

      setScoreMsg("Score & evaluation saved successfully!");
      setTimeout(() => {
        setActiveItem(null);
        fetchAssignedTeams();
      }, 1200);
    } catch (err) {
      setScoreMsg(err.response?.data?.message || "Error submitting score.");
    }
  };

  const filteredItems = assignedItems.filter((item) => {
    if (filterMode === "pending") return !item.myScore;
    if (filterMode === "scored") return !!item.myScore;
    return true;
  });

  return (
    <div className="section-container judge-dashboard-page">
      <div className="page-header flex justify-between items-center">
        <div>
          <span className="section-badge gold-badge"><Award className="badge-icon" /> JUDGING SUITE</span>
          <h1 className="page-title">Project Evaluation Matrix</h1>
          <p className="page-subtitle">
            Review assigned hackathon project submissions and evaluate across 7 standardized criteria.
          </p>
        </div>

        <div className="filter-group">
          <button
            className={`filter-pill ${filterMode === "all" ? "active" : ""}`}
            onClick={() => setFilterMode("all")}
          >
            All Assigned ({assignedItems.length})
          </button>
          <button
            className={`filter-pill ${filterMode === "pending" ? "active" : ""}`}
            onClick={() => setFilterMode("pending")}
          >
            Pending Review
          </button>
          <button
            className={`filter-pill ${filterMode === "scored" ? "active" : ""}`}
            onClick={() => setFilterMode("scored")}
          >
            Evaluated
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state-card mt-8">
          <Award className="empty-icon" />
          <h3>No Assigned Projects Found</h3>
          <p>Projects assigned to you by organizers will appear here.</p>
        </div>
      ) : (
        <div className="judge-projects-grid mt-8">
          {filteredItems.map((item) => (
            <div key={item.team._id} className="judge-project-card">
              <div className="card-top-row">
                <div>
                  <span className="hackathon-tag-sm">{item.team.hackathon?.title || "Hackathon"}</span>
                  <h3 className="team-title-text">{item.team.name}</h3>
                </div>
                <StatusBadge status={item.myScore ? "approved" : "pending"} />
              </div>

              {item.submission ? (
                <div className="submission-body-box">
                  <h4 className="project-sub-title">{item.submission.title}</h4>
                  <p className="project-sub-desc">{item.submission.description?.substring(0, 140)}...</p>

                  <div className="sub-links-group">
                    {item.submission.repoLink && (
                      <a href={item.submission.repoLink} target="_blank" rel="noreferrer" className="sub-link-pill">
                        <GitBranch className="pill-icon" /> Repo
                      </a>
                    )}
                    {item.submission.demoLink && (
                      <a href={item.submission.demoLink} target="_blank" rel="noreferrer" className="sub-link-pill text-cyan">
                        <ExternalLink className="pill-icon" /> Demo
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="no-sub-text">No project submitted yet by team.</p>
              )}

              <div className="card-bottom-row mt-4">
                {item.myScore ? (
                  <div className="score-summary-pill">
                    <Star className="star-icon" />
                    <span>Scored: <strong>{item.myScore.totalScore} / 70</strong></span>
                  </div>
                ) : (
                  <span className="pending-text">Awaiting Evaluation</span>
                )}

                <button className="btn-primary-glow sm" onClick={() => openScoreModal(item)}>
                  <Sliders className="btn-icon" /> {item.myScore ? "Edit Score" : "Evaluate Project"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7-Criteria Slider Scoring Modal */}
      {activeItem && (
        <Modal isOpen={!!activeItem} onClose={() => setActiveItem(null)} title={`Evaluate: ${activeItem.team.name}`}>
          <form onSubmit={handleSubmitScore} className="modal-form scoring-form">
            <div className="total-score-banner">
              <span>CURRENT CALCULATED TOTAL SCORE</span>
              <h2 className="score-big">{calculateTotal()} <span className="score-max">/ 70 Marks</span></h2>
            </div>

            {scoreMsg && <div className="auth-success-alert">{scoreMsg}</div>}

            <div className="sliders-container-grid">
              {[
                { key: "innovation", label: "1. Innovation & Novelty" },
                { key: "technicalComplexity", label: "2. Technical Complexity & Architecture" },
                { key: "userInterface", label: "3. UI/UX Design & Polish" },
                { key: "functionality", label: "4. Functionality & Completeness" },
                { key: "scalability", label: "5. Scalability & Performance" },
                { key: "documentation", label: "6. Code Cleanliness & README Docs" },
                { key: "presentation", label: "7. Presentation & Demo Video" },
              ].map((crit) => (
                <div key={crit.key} className="slider-group-card">
                  <div className="slider-label-row">
                    <label>{crit.label}</label>
                    <span className="slider-val-badge">{scoreForm[crit.key]} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={scoreForm[crit.key]}
                    onChange={(e) => handleSliderChange(crit.key, e.target.value)}
                    className="custom-range-slider"
                  />
                </div>
              ))}
            </div>

            <div className="form-group mt-4">
              <label><MessageSquare className="icon-inline" /> Judge Feedback & Comments</label>
              <textarea
                rows={3}
                placeholder="Provide constructive evaluation feedback for the team..."
                value={scoreForm.feedback}
                onChange={(e) => setScoreForm({ ...scoreForm, feedback: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn-primary-glow w-full mt-4">
              Submit Final Evaluation Scorecard
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
