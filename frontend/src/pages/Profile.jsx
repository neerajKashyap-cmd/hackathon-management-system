import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Sparkles, Shield, Bookmark, Save, Code } from "lucide-react";
import HackathonCard from "../components/HackathonCard";

export default function Profile({ setPage, setSelectedHackathon }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState((user?.skills || []).join(", "));
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [msg, setMsg] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    const res = await updateProfile({ name, bio, skills, avatar });
    if (res.success) {
      setMsg("Profile saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleSelectHackathon = (id) => {
    setSelectedHackathon(id);
    setPage("hackathon-detail");
  };

  return (
    <div className="section-container profile-page-container">
      <div className="profile-grid">
        {/* Profile Card Sidebar */}
        <div className="profile-sidebar-card">
          <div className="profile-avatar-wrapper">
            <img
              src={
                avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || "User")}`
              }
              alt={user?.name}
              className="profile-avatar-lg"
            />
          </div>

          <h2 className="profile-user-name">{user?.name}</h2>
          <span className={`role-badge role-${user?.role}`}>{user?.role?.toUpperCase()}</span>
          <p className="profile-user-email"><Mail className="icon-inline" /> {user?.email}</p>

          <p className="profile-user-bio">{user?.bio || "No bio added yet."}</p>

          <div className="skills-tags-wrapper">
            <span className="skills-label"><Code className="icon-inline" /> Tech Stack:</span>
            <div className="skills-flex">
              {(user?.skills || []).map((skill, idx) => (
                <span key={idx} className="tech-pill">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Form & Saved Bookmarks */}
        <div className="profile-content-area">
          <div className="card-glass-panel">
            <h3 className="panel-title"><User className="title-icon" /> Update Profile Information</h3>

            {msg && <div className="auth-success-alert">{msg}</div>}

            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Bio / Summary</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio about your developer background..."
                ></textarea>
              </div>

              <div className="form-group">
                <label>Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, Python, MongoDB, AI"
                />
              </div>

              <div className="form-group">
                <label>Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <button type="submit" className="btn-primary-glow">
                <Save className="btn-icon" /> Save Changes
              </button>
            </form>
          </div>

          {/* Bookmarked Hackathons */}
          <div className="card-glass-panel mt-6">
            <h3 className="panel-title"><Bookmark className="title-icon" /> Bookmarked Hackathons ({user?.bookmarkedHackathons?.length || 0})</h3>
            {(!user?.bookmarkedHackathons || user.bookmarkedHackathons.length === 0) ? (
              <p className="text-gray-400">No hackathons saved yet. Browse the directory to bookmark events.</p>
            ) : (
              <div className="bookmarked-list">
                {user.bookmarkedHackathons.map((h) => {
                  if (typeof h === "string") return null;
                  return (
                    <div key={h._id} className="bookmarked-item" onClick={() => handleSelectHackathon(h._id)}>
                      <img src={h.bannerImage} alt={h.title} className="bm-img" />
                      <div className="bm-details">
                        <h4>{h.title}</h4>
                        <span className="bm-prize">{h.prizePool}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
