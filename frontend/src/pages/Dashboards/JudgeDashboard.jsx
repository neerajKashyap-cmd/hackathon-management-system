import { useState, useEffect } from "react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import {
  Award,
  Star,
  CheckCircle,
  Clock,
  ExternalLink,
  Sliders,
  Send,
  MessageSquare,
  Sparkles,
  FileCode,
  Video,
  Users,
  Code,
} from "lucide-react";

export default function JudgeDashboard() {
  const [assignedItems, setAssignedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeItem, setActiveItem] = useState(null); // team + submission object
  const [filterMode, setFilterMode] = useState("all");

  const [scoreForm, setScoreForm] = useState({
    innovation: 7,
    technicalComplexity: 7,
    userInterface: 7,
    functionality: 7,
    scalability: 7,
    documentation: 7,
    presentation: 7,
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

  const openEvaluationModal = (item) => {
    setScoreMsg("");
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
    if (submitting || !activeItem) return;

    setSubmitting(true);
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
      }, 1000);
    } catch (err) {
      setScoreMsg(err.response?.data?.message || "Error submitting score.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = assignedItems.filter((item) => {
    if (filterMode === "pending") return !item.myScore;
    if (filterMode === "scored") return !!item.myScore;
    return true;
  });

  return (
    <div className="judge-dashboard-container pb-16">
      {/* Top Header */}
      <div className="dashboard-header-bar">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-badge"><Award className="badge-icon" /> JUDGING PORTAL</span>
          </div>
          <h1 className="page-title text-2xl font-bold text-white">Assigned Projects to Evaluate</h1>
          <p className="text-sm text-gray-400">
            Evaluate submitted hackathon projects assigned to you by the event organizer.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === "all" ? "bg-cyan-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
            }`}
            onClick={() => setFilterMode("all")}
          >
            All Projects ({assignedItems.length})
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === "pending" ? "bg-amber-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
            }`}
            onClick={() => setFilterMode("pending")}
          >
            Pending ({assignedItems.filter((i) => !i.myScore).length})
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === "scored" ? "bg-emerald-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
            }`}
            onClick={() => setFilterMode("scored")}
          >
            Evaluated ({assignedItems.filter((i) => !!i.myScore).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner-container py-16">
          <div className="spinner"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="dash-card-box p-12 text-center max-w-xl mx-auto">
          <Award className="w-12 h-12 text-cyan mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
          <p className="text-sm text-gray-400">
            Organizers will assign approved hackathon teams to expert judges for evaluation.
          </p>
        </div>
      ) : (
        <div className="judge-projects-grid">
          {filteredItems.map((item) => {
            const team = item.team;
            const sub = item.submission;
            const hasScore = !!item.myScore;

            return (
              <div key={team._id} className="judge-project-card">
                <div>
                  <div className="judge-card-header">
                    <span className="text-2xs font-mono font-bold text-cyan uppercase tracking-wider">
                      {team.hackathon?.title || "Hackathon Event"}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                      hasScore ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                      {hasScore ? `Scored (${item.myScore.totalScore}/70)` : "Pending"}
                    </span>
                  </div>

                  <div className="judge-team-name">{team.name}</div>
                  <div className="text-xs text-gray-400 font-mono mb-3">
                    Leader: {team.leader?.name || "N/A"} | {team.members?.length || 1} Members
                  </div>

                  {sub ? (
                    <div className="judge-submission-box">
                      <div className="font-bold text-sm text-cyan mb-1 flex items-center gap-1.5">
                        <Code className="w-4 h-4" /> {sub.title}
                      </div>
                      {sub.description && (
                        <p className="text-xs text-gray-300 line-clamp-2 mb-3 leading-relaxed">
                          {sub.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs font-mono pt-1">
                        {sub.githubRepo && (
                          <a
                            href={sub.githubRepo}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan hover:underline inline-flex items-center gap-1 bg-gray-900 px-2 py-1 rounded border border-gray-800"
                          >
                            <FileCode className="w-3.5 h-3.5" /> GitHub <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}
                        {sub.demoUrl && (
                          <a
                            href={sub.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline inline-flex items-center gap-1 bg-gray-900 px-2 py-1 rounded border border-gray-800"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Live Demo <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gray-950/30 border border-dashed border-gray-800 text-center text-xs text-gray-500 my-3">
                      No submission details provided yet.
                    </div>
                  )}
                </div>

                <button
                  className={hasScore ? "btn-secondary-glow w-full flex items-center justify-center gap-2 mt-4" : "btn-primary-glow w-full flex items-center justify-center gap-2 mt-4"}
                  onClick={() => openEvaluationModal(item)}
                >
                  <Sliders className="w-4 h-4" />
                  <span>{hasScore ? "Edit Score & Feedback" : "Evaluate & Score Team"}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Evaluation Rubric Modal */}
      <Modal isOpen={!!activeItem} onClose={() => !submitting && setActiveItem(null)} title={`Evaluate: ${activeItem?.team?.name || ""}`}>
        <form onSubmit={handleSubmitScore} className="modal-form space-y-4">
          {scoreMsg && <div className="auth-success-alert mb-3">{scoreMsg}</div>}

          <div className="space-y-3 my-2">
            {[
              { key: "innovation", label: "Innovation & Originality (0-10)" },
              { key: "technicalComplexity", label: "Technical Complexity & Code Quality (0-10)" },
              { key: "userInterface", label: "User Interface & Experience (0-10)" },
              { key: "functionality", label: "Functionality & Working Demo (0-10)" },
              { key: "scalability", label: "Scalability & Architecture (0-10)" },
              { key: "documentation", label: "Documentation & Code Structure (0-10)" },
              { key: "presentation", label: "Presentation & Pitch Clarity (0-10)" },
            ].map((crit) => (
              <div key={crit.key} className="bg-gray-950/60 p-3 rounded-xl border border-gray-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-200">{crit.label}</label>
                  <span className="font-mono text-cyan font-bold text-sm">{scoreForm[crit.key]} / 10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={scoreForm[crit.key]}
                  onChange={(e) => handleSliderChange(crit.key, e.target.value)}
                  className="w-full accent-cyan cursor-pointer"
                  disabled={submitting}
                />
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-center my-3">
            <div className="text-2xs font-mono text-cyan uppercase tracking-wider font-bold">Total Score</div>
            <div className="font-mono text-3xl font-black text-white mt-1">
              {calculateTotal()} <span className="text-sm text-gray-400 font-normal">/ 70</span>
            </div>
          </div>

          <div className="form-group">
            <label><MessageSquare className="icon-inline" /> Judge Feedback & Written Assessment</label>
            <textarea
              rows={3}
              value={scoreForm.feedback}
              onChange={(e) => setScoreForm({ ...scoreForm, feedback: e.target.value })}
              placeholder="Provide constructive feedback for the team..."
              disabled={submitting}
            ></textarea>
          </div>

          <button type="submit" className="btn-primary-glow w-full mt-4 flex items-center justify-center gap-2" disabled={submitting}>
            {submitting ? (
              <>
                <span className="btn-spinner-sm"></span>
                <span>Saving Score...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Final Score ({calculateTotal()}/70)</span>
              </>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
