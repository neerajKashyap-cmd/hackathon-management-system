import { useState, useEffect } from "react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import {
  Users,
  Trophy,
  Code,
  ShieldCheck,
  Search,
  UserX,
  UserCheck,
  Trash2,
  Edit,
  ShieldAlert,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Edit Role Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("participant");

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [userSearch, roleFilter]);

  const fetchStats = () => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  };

  const fetchUsers = () => {
    setLoading(true);
    let queryParams = new URLSearchParams();
    if (userSearch) queryParams.append("search", userSearch);
    if (roleFilter !== "All") queryParams.append("role", roleFilter);

    api
      .get(`/admin/users?${queryParams.toString()}`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleToggleBlock = async (userId, currentBlocked) => {
    try {
      await api.patch(`/admin/users/${userId}/block`, { isBlocked: !currentBlocked });
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Error toggling block status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting user");
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.patch(`/admin/users/${selectedUser._id}/role`, { role: newRole });
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating role");
    }
  };

  return (
    <div className="section-container admin-dashboard-page">
      <div className="page-header">
        <span className="section-badge red-badge"><ShieldAlert className="badge-icon" /> ADMIN CONSOLE</span>
        <h1 className="page-title">Platform Governance & Analytics</h1>
        <p className="page-subtitle">
          Manage system users, authorize roles, enforce compliance, and view global analytics.
        </p>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="stats-grid mb-8">
          <StatCard title="TOTAL PLATFORM USERS" value={stats.totalUsers} subtitle={`${stats.roleCounts.participants} Participants, ${stats.roleCounts.judges} Judges`} icon={Users} color="violet" />
          <StatCard title="TOTAL HACKATHONS" value={stats.totalHackathons} subtitle={`${stats.roleCounts.organizers} Registered Organizers`} icon={Trophy} color="cyan" />
          <StatCard title="TOTAL TEAMS" value={stats.totalTeams} subtitle="Formed & Registered" icon={Users} color="emerald" />
          <StatCard title="TOTAL SUBMISSIONS" value={stats.totalSubmissions} subtitle="Projects Submitted" icon={Code} color="gold" />
        </div>
      )}

      {/* User Management Section */}
      <div className="card-glass-panel">
        <div className="panel-header-row">
          <h3 className="panel-title"><Users className="title-icon" /> User Directory & Account Governance</h3>

          <div className="table-filter-bar">
            <div className="search-input-box sm">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div className="role-filter-pills">
              {["All", "participant", "organizer", "judge", "admin"].map((r) => (
                <button
                  key={r}
                  className={`filter-pill ${roleFilter === r ? "active" : ""}`}
                  onClick={() => setRoleFilter(r)}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell-info">
                        <img src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`} alt={u.name} className="user-avatar-sm" />
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <StatusBadge status={u.isBlocked ? "blocked" : "approved"} />
                    </td>
                    <td className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          className="icon-action-btn edit"
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRole(u.role);
                          }}
                          title="Change Role"
                        >
                          <Edit />
                        </button>
                        <button
                          className={`icon-action-btn ${u.isBlocked ? "unblock" : "block"}`}
                          onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                          title={u.isBlocked ? "Unblock Account" : "Block Account"}
                        >
                          {u.isBlocked ? <UserCheck /> : <UserX />}
                        </button>
                        <button
                          className="icon-action-btn delete"
                          onClick={() => handleDeleteUser(u._id)}
                          title="Delete User"
                        >
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

      {/* Edit Role Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Edit User Role: ${selectedUser?.name}`}>
        <form onSubmit={handleUpdateRole} className="modal-form">
          <div className="form-group">
            <label>User Role</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="form-select">
              <option value="participant">Participant</option>
              <option value="organizer">Organizer</option>
              <option value="judge">Judge</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <button type="submit" className="btn-primary-glow w-full mt-4">
            Save Role Update
          </button>
        </form>
      </Modal>
    </div>
  );
}
