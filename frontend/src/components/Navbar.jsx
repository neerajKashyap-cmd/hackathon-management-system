import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Zap,
  Trophy,
  Users,
  Grid,
  ShieldAlert,
  Award,
  BookMarked,
  LogOut,
  User as UserIcon,
  Sparkles,
  Menu,
  X,
  Compass,
} from "lucide-react";

export default function Navbar({ currentPage, setPage, onOpenAuth }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isJudge = user?.role === "judge";
  const isAdmin = user?.role === "admin";
  const isOrganizer = user?.role === "organizer";
  const isParticipant = user?.role === "participant";

  const navigateTo = (page) => {
    setPage(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setPage("home");
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <div className="nav-brand" onClick={() => navigateTo("home")}>
          <div className="brand-icon-wrapper">
            <Zap className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">HACK<span className="brand-highlight">SPHERE</span></span>
            <span className="brand-tag">OS v2.4</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="nav-links">
          <button
            className={`nav-item ${currentPage === "home" ? "active" : ""}`}
            onClick={() => navigateTo("home")}
          >
            <Compass className="nav-icon" />
            Home
          </button>

          <button
            className={`nav-item ${currentPage === "hackathons" ? "active" : ""}`}
            onClick={() => navigateTo("hackathons")}
          >
            <Trophy className="nav-icon" />
            Hackathons
          </button>

          <button
            className={`nav-item ${currentPage === "gallery" ? "active" : ""}`}
            onClick={() => navigateTo("gallery")}
          >
            <Grid className="nav-icon" />
            Projects
          </button>

          <button
            className={`nav-item ${currentPage === "leaderboard" ? "active" : ""}`}
            onClick={() => navigateTo("leaderboard")}
          >
            <Award className="nav-icon" />
            Leaderboard
          </button>

          {/* Role-Specific Dashboards */}
          {user && (
            <>
              {isParticipant && (
                <button
                  className={`nav-item ${currentPage === "dashboard" ? "active" : ""}`}
                  onClick={() => navigateTo("dashboard")}
                >
                  <Users className="nav-icon" />
                  My Dashboard
                </button>
              )}
              {isOrganizer && (
                <button
                  className={`nav-item ${currentPage === "organizer" ? "active" : ""}`}
                  onClick={() => navigateTo("organizer")}
                >
                  <Sparkles className="nav-icon" />
                  Organizer Hub
                </button>
              )}
              {isJudge && (
                <button
                  className={`nav-item ${currentPage === "judge" ? "active" : ""}`}
                  onClick={() => navigateTo("judge")}
                >
                  <Award className="nav-icon" />
                  Judging Suite
                </button>
              )}
              {isAdmin && (
                <button
                  className={`nav-item ${currentPage === "admin" ? "active" : ""}`}
                  onClick={() => navigateTo("admin")}
                >
                  <ShieldAlert className="nav-icon" />
                  Admin Console
                </button>
              )}
            </>
          )}
        </div>

        {/* User Right Action */}
        <div className="nav-user-actions">
          {user ? (
            <div className="user-profile-menu">
              <button
                className={`profile-pill ${currentPage === "profile" ? "active" : ""}`}
                onClick={() => navigateTo("profile")}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="user-avatar-sm"
                />
                <div className="user-info-text">
                  <span className="user-name-text">{user.name}</span>
                  <span className={`role-badge role-${user.role}`}>{user.role}</span>
                </div>
              </button>
              <button className="icon-btn-danger" onClick={handleLogout} title="Sign Out">
                <LogOut className="btn-icon" />
              </button>
            </div>
          ) : (
            <button className="btn-primary-glow" onClick={onOpenAuth}>
              <UserIcon className="btn-icon" />
              Sign In / Register
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer">
          <button className="mobile-link" onClick={() => navigateTo("home")}>Home</button>
          <button className="mobile-link" onClick={() => navigateTo("hackathons")}>Hackathons</button>
          <button className="mobile-link" onClick={() => navigateTo("gallery")}>Projects Gallery</button>
          <button className="mobile-link" onClick={() => navigateTo("leaderboard")}>Leaderboard</button>
          {user && (
            <>
              {isParticipant && <button className="mobile-link" onClick={() => navigateTo("dashboard")}>Participant Dashboard</button>}
              {isOrganizer && <button className="mobile-link" onClick={() => navigateTo("organizer")}>Organizer Hub</button>}
              {isJudge && <button className="mobile-link" onClick={() => navigateTo("judge")}>Judging Suite</button>}
              {isAdmin && <button className="mobile-link" onClick={() => navigateTo("admin")}>Admin Console</button>}
              <button className="mobile-link" onClick={() => navigateTo("profile")}>My Profile</button>
              <button className="mobile-link danger" onClick={handleLogout}>Sign Out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
