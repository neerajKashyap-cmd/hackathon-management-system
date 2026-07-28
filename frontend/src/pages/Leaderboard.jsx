import { useState, useEffect } from "react";
import api from "../services/api";
import { Trophy, Award, Sparkles, Medal, ExternalLink, GitBranch, FileCheck } from "lucide-react";
import CertificateModal from "../components/CertificateModal";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certModalData, setCertModalData] = useState(null);

  useEffect(() => {
    api
      .get("/judging/leaderboard")
      .then((res) => {
        setLeaderboard(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const openCertificate = (item, position) => {
    setCertModalData({
      recipientName: item.teamName,
      hackathonTitle: "HackSphere Global Innovation Challenge",
      position,
      teamName: item.teamName,
    });
  };

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="section-container leaderboard-page">
      <div className="page-header text-center">
        <span className="section-badge"><Trophy className="badge-icon" /> OFFICIAL RANKINGS</span>
        <h1 className="page-title">Global Hackathon Leaderboard</h1>
        <p className="page-subtitle">
          Real-time aggregated score rankings across all evaluated submissions.
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state-card">
          <Trophy className="empty-icon" />
          <h3>No Leaderboard Rankings Available</h3>
          <p>Scores will populate as judges complete project reviews.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div className="podium-wrapper">
            {/* Rank 2 - Silver */}
            {top3[1] && (
              <div className="podium-card rank-2">
                <div className="podium-rank-pill silver">
                  <Medal className="pill-icon" /> 2nd Place
                </div>
                <h3 className="podium-team-name">{top3[1].teamName}</h3>
                <span className="podium-project">{top3[1].submission?.title || "Project Submission"}</span>
                <div className="podium-score">
                  {top3[1].averageScore} <span className="score-total">/ 70</span>
                </div>
                <button className="btn-secondary-glow" onClick={() => openCertificate(top3[1], 2)}>
                  <FileCheck className="btn-icon" /> Award Certificate
                </button>
              </div>
            )}

            {/* Rank 1 - Gold */}
            {top3[0] && (
              <div className="podium-card rank-1">
                <div className="podium-rank-pill gold">
                  <Trophy className="pill-icon" /> 1st Winner
                </div>
                <h2 className="podium-team-name">{top3[0].teamName}</h2>
                <span className="podium-project">{top3[0].submission?.title || "Project Submission"}</span>
                <div className="podium-score gold-score">
                  {top3[0].averageScore} <span className="score-total">/ 70</span>
                </div>
                <button className="btn-primary-glow" onClick={() => openCertificate(top3[0], 1)}>
                  <Award className="btn-icon" /> Winner Certificate
                </button>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {top3[2] && (
              <div className="podium-card rank-3">
                <div className="podium-rank-pill bronze">
                  <Medal className="pill-icon" /> 3rd Place
                </div>
                <h3 className="podium-team-name">{top3[2].teamName}</h3>
                <span className="podium-project">{top3[2].submission?.title || "Project Submission"}</span>
                <div className="podium-score">
                  {top3[2].averageScore} <span className="score-total">/ 70</span>
                </div>
                <button className="btn-secondary-glow" onClick={() => openCertificate(top3[2], 3)}>
                  <FileCheck className="btn-icon" /> Award Certificate
                </button>
              </div>
            )}
          </div>

          {/* Complete Rankings Table */}
          <div className="card-glass-panel mt-12">
            <h3 className="panel-title"><Award className="title-icon" /> Complete Team Standings</h3>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team Name</th>
                    <th>Submitted Project</th>
                    <th>Reviews</th>
                    <th>Average Score</th>
                    <th>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((item, idx) => (
                    <tr key={item.teamId || idx}>
                      <td>
                        <span className={`rank-pill rank-${idx + 1}`}>#{idx + 1}</span>
                      </td>
                      <td className="font-bold text-white">{item.teamName}</td>
                      <td>{item.submission?.title || "Pending Submission"}</td>
                      <td>{item.judgeCount} Judges</td>
                      <td>
                        <span className="score-badge-highlight">{item.averageScore} / 70</span>
                      </td>
                      <td>
                        <button className="btn-secondary-link" onClick={() => openCertificate(item, idx + 1)}>
                          <FileCheck className="btn-icon" /> Cert
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Certificate Modal */}
      {certModalData && (
        <CertificateModal
          isOpen={!!certModalData}
          onClose={() => setCertModalData(null)}
          recipientName={certModalData.recipientName}
          hackathonTitle={certModalData.hackathonTitle}
          position={certModalData.position}
          teamName={certModalData.teamName}
        />
      )}
    </div>
  );
}
