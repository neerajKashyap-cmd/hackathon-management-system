import { useState, useEffect } from "react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  Users,
  Check,
  X,
  Award,
  Sparkles,
  UserPlus,
  Calendar,
  Lock,
  Unlock,
  ShieldCheck,
  UserX,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

export default function OrganizerDashboard({ setPage, setSelectedHackathon }) {
  const [myHackathons, setMyHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Hackathon for Registrations / Winners Management
  const [activeHackathon, setActiveHackathon] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [availableJudges, setAvailableJudges] = useState([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [showAssignJudgeModal, setShowAssignJudgeModal] = useState(null); // teamId
  const [selectedTeamJudgeId, setSelectedTeamJudgeId] = useState("");

  // Event Level Judge Management Modal
  const [managingJudgesHackathon, setManagingJudgesHackathon] = useState(null);
  const [newJudgeIdToAssign, setNewJudgeIdToAssign] = useState("");

  // Form State for Hackathon
  const [form, setForm] = useState({
    title: "",
    tagline: "",
    theme: "",
    description: "",
    rules: "",
    mode: "Online",
    venue: "Virtual Platform",
    bannerImage: "",
    prizePool: "$10,000",
    maxTeamSize: 4,
    registrationDeadline: "",
    submissionDeadline: "",
  });
  const [modalErr, setModalErr] = useState("");

  useEffect(() => {
    fetchMyHackathons();
    fetchAvailableJudges();
  }, []);

  const fetchMyHackathons = () => {
    setLoading(true);
    api
      .get("/organizer/hackathons")
      .then((res) => setMyHackathons(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchAvailableJudges = () => {
    api
      .get("/organizer/judges")
      .then((res) => setAvailableJudges(res.data))
      .catch((err) => console.error(err));
  };

  const loadRegistrations = (hackathon) => {
    setActiveHackathon(hackathon);
    api
      .get(`/organizer/hackathons/${hackathon._id}/registrations`)
      .then((res) => setRegistrations(res.data))
      .catch((err) => console.error(err));
  };

  // Image Upload with HTML5 Canvas auto-compression to avoid payload size errors
  const handleImageFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setForm((prev) => ({ ...prev, bannerImage: compressedDataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHackathon = async (e) => {
    e.preventDefault();
    setModalErr("");
    try {
      if (editingHackathon) {
        await api.put(`/organizer/hackathons/${editingHackathon._id}`, form);
      } else {
        await api.post("/organizer/hackathons", form);
      }
      setShowCreateModal(false);
      setEditingHackathon(null);
      fetchMyHackathons();
    } catch (err) {
      setModalErr(err.response?.data?.message || err.message || "Error saving hackathon");
    }
  };

  const handleToggleRegistration = async (hackathonId, currentStatus) => {
    try {
      await api.patch(`/organizer/hackathons/${hackathonId}/registration`, { isOpen: !currentStatus });
      fetchMyHackathons();
    } catch (err) {
      alert(err.response?.data?.message || "Error toggling registration");
    }
  };

  const handleDeleteHackathon = async (hackathonId) => {
    if (!window.confirm("Are you sure you want to delete this hackathon?")) return;
    try {
      await api.delete(`/organizer/hackathons/${hackathonId}`);
      fetchMyHackathons();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting hackathon");
    }
  };

  const handleUpdateTeamStatus = async (teamId, status) => {
    try {
      await api.patch(`/organizer/teams/${teamId}/status`, { status });
      if (activeHackathon) loadRegistrations(activeHackathon);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating team status");
    }
  };

  const handleAssignJudgeToTeam = async (e) => {
    e.preventDefault();
    if (!showAssignJudgeModal || !selectedTeamJudgeId) return;
    try {
      await api.post(`/organizer/teams/${showAssignJudgeModal}/assign-judge`, { judgeId: selectedTeamJudgeId });
      setShowAssignJudgeModal(null);
      setSelectedTeamJudgeId("");
      if (activeHackathon) loadRegistrations(activeHackathon);
    } catch (err) {
      alert(err.response?.data?.message || "Error assigning judge");
    }
  };

  // Hackathon-Level Judge Operations (Assign / Delete)
  const handleAssignJudgeToHackathon = async (e) => {
    e.preventDefault();
    if (!managingJudgesHackathon || !newJudgeIdToAssign) return;
    try {
      const res = await api.post(`/organizer/hackathons/${managingJudgesHackathon._id}/judges`, {
        judgeId: newJudgeIdToAssign,
      });
      setManagingJudgesHackathon(res.data);
      setNewJudgeIdToAssign("");
      fetchMyHackathons();
    } catch (err) {
      alert(err.response?.data?.message || "Error assigning judge to hackathon");
    }
  };

  const handleRemoveJudgeFromHackathon = async (judgeId) => {
    if (!managingJudgesHackathon) return;
    if (!window.confirm("Remove this judge from the hackathon?")) return;
    try {
      const res = await api.delete(`/organizer/hackathons/${managingJudgesHackathon._id}/judges/${judgeId}`);
      setManagingJudgesHackathon(res.data);
      fetchMyHackathons();
    } catch (err) {
      alert(err.response?.data?.message || "Error removing judge from hackathon");
    }
  };

  const handlePublishResults = async () => {
    if (!activeHackathon) return;
    try {
      await api.post(`/organizer/hackathons/${activeHackathon._id}/publish-results`, {
        winners: registrations.slice(0, 3).map((t, idx) => ({
          team: t._id,
          position: idx + 1,
          awardTitle: idx === 0 ? "1st Winner" : idx === 1 ? "2nd Winner" : "3rd Winner",
        })),
      });
      alert("Hackathon results published successfully!");
      fetchMyHackathons();
    } catch (err) {
      alert(err.response?.data?.message || "Error publishing results");
    }
  };

  const openCreateModal = (hackathonToEdit = null) => {
    setModalErr("");
    if (hackathonToEdit) {
      setEditingHackathon(hackathonToEdit);
      setForm({
        title: hackathonToEdit.title || "",
        tagline: hackathonToEdit.tagline || "",
        theme: hackathonToEdit.theme || "",
        description: hackathonToEdit.description || "",
        rules: hackathonToEdit.rules || "",
        mode: hackathonToEdit.mode || "Online",
        venue: hackathonToEdit.venue || "",
        bannerImage: hackathonToEdit.bannerImage || "",
        prizePool: hackathonToEdit.prizePool || "$10,000",
        maxTeamSize: hackathonToEdit.maxTeamSize || 4,
        registrationDeadline: hackathonToEdit.registrationDeadline ? new Date(hackathonToEdit.registrationDeadline).toISOString().slice(0, 16) : "",
        submissionDeadline: hackathonToEdit.submissionDeadline ? new Date(hackathonToEdit.submissionDeadline).toISOString().slice(0, 16) : "",
      });
    } else {
      setEditingHackathon(null);
      setForm({
        title: "",
        tagline: "",
        theme: "Artificial Intelligence",
        description: "",
        rules: "",
        mode: "Online",
        venue: "Virtual Platform",
        bannerImage: "",
        prizePool: "$10,000",
        maxTeamSize: 4,
        registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        submissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      });
    }
    setShowCreateModal(true);
  };

  return (
    <div className="section-container organizer-dashboard-page">
      <div className="page-header flex justify-between items-center">
        <div>
          <span className="section-badge"><Sparkles className="badge-icon" /> ORGANIZER PORTAL</span>
          <h1 className="page-title">Hackathon Management Hub</h1>
          <p className="page-subtitle">
            Create events, review registered teams, assign & manage judges, and announce hackathon winners.
          </p>
        </div>

        <button className="btn-primary-glow lg" onClick={() => openCreateModal()}>
          <Plus className="btn-icon" /> Host New Hackathon
        </button>
      </div>

      {/* My Hackathons Grid */}
      <div className="card-glass-panel mb-8">
        <h3 className="panel-title"><Trophy className="title-icon" /> My Managed Hackathons ({myHackathons.length})</h3>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
          </div>
        ) : myHackathons.length === 0 ? (
          <div className="empty-state-card">
            <Trophy className="empty-icon" />
            <h4>No Hackathons Created Yet</h4>
            <p>Click "Host New Hackathon" to set up your first event.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Theme & Mode</th>
                  <th>Prize Pool</th>
                  <th>Assigned Judges</th>
                  <th>Reg Status</th>
                  <th>Results</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myHackathons.map((h) => (
                  <tr key={h._id}>
                    <td>
                      <div className="font-bold text-white">{h.title}</div>
                      <div className="text-xs text-gray-400">Created: {new Date(h.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <span className="theme-tag-sm">{h.theme}</span>
                      <span className="text-xs ml-2 text-gray-300">({h.mode})</span>
                    </td>
                    <td className="font-semibold text-amber-400">{h.prizePool}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="badge-neutral font-mono text-xs">
                          {h.assignedJudges?.length || 0} Judges
                        </span>
                        <button
                          className="btn-secondary-glow btn-sm"
                          onClick={() => setManagingJudgesHackathon(h)}
                        >
                          <ShieldCheck className="btn-icon" /> Manage
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className={`toggle-pill ${h.registrationOpen ? "open" : "closed"}`}
                        onClick={() => handleToggleRegistration(h._id, h.registrationOpen)}
                      >
                        {h.registrationOpen ? <Unlock className="icon-xs" /> : <Lock className="icon-xs" />}
                        {h.registrationOpen ? "Open" : "Closed"}
                      </button>
                    </td>
                    <td>
                      <StatusBadge status={h.resultsPublished ? "completed" : "pending"} />
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          className="btn-table-action"
                          onClick={() => loadRegistrations(h)}
                        >
                          <Users className="btn-icon" /> View Teams
                        </button>
                        <button className="icon-action-btn edit" onClick={() => openCreateModal(h)}>
                          <Edit />
                        </button>
                        <button className="icon-action-btn delete" onClick={() => handleDeleteHackathon(h._id)}>
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Hackathon Registrations Manager Panel */}
      {activeHackathon && (
        <div className="card-glass-panel mb-8">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <Users className="title-icon" /> Registered Teams for: <span className="text-cyan">{activeHackathon.title}</span>
                <span className="badge-success ml-3 font-mono text-xs">{registrations.length} Teams Registered</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">Review team rosters, approve or reject registrations, and inspect submitted project links.</p>
            </div>

            <button className="btn-hero-primary sm" onClick={handlePublishResults}>
              <Award className="btn-icon" /> Publish Results & Announce Winners
            </button>
          </div>

          {registrations.length === 0 ? (
            <p className="text-gray-400 py-4">No teams registered for this hackathon yet.</p>
          ) : (
            <div className="table-responsive mt-4">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Leader Email</th>
                    <th>Roster Count</th>
                    <th>Project Submission</th>
                    <th>Assigned Judges</th>
                    <th>Approval Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((t) => (
                    <tr key={t._id}>
                      <td className="font-bold text-white">{t.name}</td>
                      <td>
                        <div className="font-medium text-gray-200">{t.leader?.name || "N/A"}</div>
                        <div className="text-xs font-mono text-cyan">{t.leader?.email}</div>
                      </td>
                      <td className="font-mono text-gray-300">{t.members?.length || 1} Members</td>
                      <td>
                        {t.submission ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-emerald-400 text-xs font-bold">✔ {t.submission.title}</span>
                            {t.submission.githubRepo && (
                              <a
                                href={t.submission.githubRepo}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-cyan underline"
                              >
                                View GitHub Repo
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs italic">Pending Submission</span>
                        )}
                      </td>
                      <td>
                        {(t.assignedJudges || []).map((j) => (
                          <span key={j._id} className="judge-pill">{j.name}</span>
                        ))}
                        <button
                          className="btn-assign-sm"
                          onClick={() => setShowAssignJudgeModal(t._id)}
                        >
                          + Assign
                        </button>
                      </td>
                      <td>
                        <StatusBadge status={t.status || "pending"} />
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="icon-action-btn check"
                            onClick={() => handleUpdateTeamStatus(t._id, "approved")}
                            title="Approve Team Registration"
                          >
                            <Check />
                          </button>
                          <button
                            className="icon-action-btn cross"
                            onClick={() => handleUpdateTeamStatus(t._id, "rejected")}
                            title="Reject Team Registration"
                          >
                            <X />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Hackathon Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={editingHackathon ? "Edit Hackathon" : "Create New Hackathon"}>
        <form onSubmit={handleSaveHackathon} className="modal-form">
          {modalErr && <div className="auth-error-alert">{modalErr}</div>}

          <div className="form-group">
            <label>Hackathon Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>Tagline</label>
            <input type="text" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Short catchphrase..." />
          </div>

          <div className="form-group">
            <label>Theme</label>
            <input type="text" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="AI, Web3, Full Stack..." required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required></textarea>
          </div>

          <div className="form-group">
            <label><ImageIcon className="icon-inline" /> Banner Image (Optional Image URL or File Upload)</label>
            <input
              type="text"
              value={form.bannerImage}
              onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
              placeholder="Paste Image URL (https://...)..."
            />
            <div className="flex items-center gap-2 mt-2">
              <Upload className="icon-inline text-cyan" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileSelect}
                className="text-xs text-gray-400"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">If left empty, a high-tech banner image will be automatically assigned.</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Format Mode</label>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            <div className="form-group">
              <label>Prize Pool</label>
              <input type="text" value={form.prizePool} onChange={(e) => setForm({ ...form, prizePool: e.target.value })} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Registration Deadline</label>
              <input type="datetime-local" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Submission Deadline</label>
              <input type="datetime-local" value={form.submissionDeadline} onChange={(e) => setForm({ ...form, submissionDeadline: e.target.value })} required />
            </div>
          </div>

          <button type="submit" className="btn-primary-glow w-full mt-4">
            {editingHackathon ? "Save Changes" : "Create & Launch Hackathon"}
          </button>
        </form>
      </Modal>

      {/* Event Level Judge Management Modal (Assign, Edit & Delete Judges) */}
      <Modal
        isOpen={!!managingJudgesHackathon}
        onClose={() => setManagingJudgesHackathon(null)}
        title={`Manage Judges for: ${managingJudgesHackathon?.title || ""}`}
      >
        <div className="modal-body p-0">
          {/* Currently Assigned Judges */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
              Currently Assigned Event Judges ({managingJudgesHackathon?.assignedJudges?.length || 0})
            </h4>

            {!managingJudgesHackathon?.assignedJudges || managingJudgesHackathon.assignedJudges.length === 0 ? (
              <p className="text-xs text-gray-400 italic bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                No judges assigned to this hackathon yet. Assign an expert judge below.
              </p>
            ) : (
              <div className="members-list">
                {managingJudgesHackathon.assignedJudges.map((j) => (
                  <div key={j._id} className="member-row justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={j.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${j.name}`}
                        alt={j.name}
                        className="user-avatar-sm"
                      />
                      <div>
                        <div className="member-name">{j.name}</div>
                        <div className="member-email">{j.email}</div>
                      </div>
                    </div>

                    <button
                      className="btn-secondary-danger"
                      onClick={() => handleRemoveJudgeFromHackathon(j._id)}
                      title="Unassign / Remove Judge"
                    >
                      <UserX className="btn-icon" /> Remove Judge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assign New Judge Form */}
          <form onSubmit={handleAssignJudgeToHackathon} className="modal-form pt-4 border-t border-gray-800">
            <div className="form-group">
              <label>Assign New Platform Judge</label>
              <select
                value={newJudgeIdToAssign}
                onChange={(e) => setNewJudgeIdToAssign(e.target.value)}
                className="form-select"
                required
              >
                <option value="">-- Choose Judge to Assign --</option>
                {availableJudges.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.name} ({j.email})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary-glow w-full mt-3">
              <UserPlus className="btn-icon" /> Assign Judge to Hackathon
            </button>
          </form>
        </div>
      </Modal>

      {/* Assign Judge To Team Modal */}
      <Modal isOpen={!!showAssignJudgeModal} onClose={() => setShowAssignJudgeModal(null)} title="Assign Judge to Team">
        <form onSubmit={handleAssignJudgeToTeam} className="modal-form">
          <div className="form-group">
            <label>Select Expert Judge</label>
            <select value={selectedTeamJudgeId} onChange={(e) => setSelectedTeamJudgeId(e.target.value)} className="form-select" required>
              <option value="">-- Choose Judge --</option>
              {availableJudges.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.name} ({j.email})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary-glow w-full mt-4">
            Confirm Judge Assignment
          </button>
        </form>
      </Modal>
    </div>
  );
}
