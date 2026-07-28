import { useState, useEffect } from "react";
import api from "../services/api";
import HackathonCard from "../components/HackathonCard";
import { Search, Filter, Bookmark, Trophy, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Hackathons({ setPage, setSelectedHackathon }) {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, [search, modeFilter, statusFilter]);

  const fetchHackathons = () => {
    setLoading(true);
    let queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (modeFilter !== "All") queryParams.append("mode", modeFilter);
    if (statusFilter !== "All") queryParams.append("status", statusFilter);

    api
      .get(`/hackathons?${queryParams.toString()}`)
      .then((res) => {
        setHackathons(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSelect = (id) => {
    setSelectedHackathon(id);
    setPage("hackathon-detail");
  };

  const filteredList = onlyBookmarks
    ? hackathons.filter((h) =>
        user?.bookmarkedHackathons?.some((b) => (typeof b === "string" ? b : b._id) === h._id)
      )
    : hackathons;

  return (
    <div className="hackathons-directory-page">
      <div className="page-header">
        <div className="section-container">
          <span className="section-badge"><Trophy className="badge-icon" /> DISCOVER EVENTS</span>
          <h1 className="page-title">Hackathon Directory</h1>
          <p className="page-subtitle">
            Explore global challenges, join innovative teams, and build game-changing applications.
          </p>

          {/* Search & Filter Bar */}
          <div className="search-filter-wrapper">
            <div className="search-input-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by hackathon title, theme, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-controls-row">
              {/* Mode filter pills */}
              <div className="filter-group">
                <span className="filter-label">Mode:</span>
                <button
                  className={`filter-pill ${modeFilter === "All" ? "active" : ""}`}
                  onClick={() => setModeFilter("All")}
                >
                  All
                </button>
                <button
                  className={`filter-pill ${modeFilter === "Online" ? "active" : ""}`}
                  onClick={() => setModeFilter("Online")}
                >
                  Online
                </button>
                <button
                  className={`filter-pill ${modeFilter === "Offline" ? "active" : ""}`}
                  onClick={() => setModeFilter("Offline")}
                >
                  Offline
                </button>
              </div>

              {/* Status filter pills */}
              <div className="filter-group">
                <span className="filter-label">Status:</span>
                <button
                  className={`filter-pill ${statusFilter === "All" ? "active" : ""}`}
                  onClick={() => setStatusFilter("All")}
                >
                  All
                </button>
                <button
                  className={`filter-pill ${statusFilter === "ongoing" ? "active" : ""}`}
                  onClick={() => setStatusFilter("ongoing")}
                >
                  Ongoing
                </button>
                <button
                  className={`filter-pill ${statusFilter === "upcoming" ? "active" : ""}`}
                  onClick={() => setStatusFilter("upcoming")}
                >
                  Upcoming
                </button>
                <button
                  className={`filter-pill ${statusFilter === "completed" ? "active" : ""}`}
                  onClick={() => setStatusFilter("completed")}
                >
                  Completed
                </button>
              </div>

              {/* Saved bookmarks toggle */}
              {user && (
                <button
                  className={`bookmark-toggle-btn ${onlyBookmarks ? "active" : ""}`}
                  onClick={() => setOnlyBookmarks(!onlyBookmarks)}
                >
                  <Bookmark className="btn-icon" />
                  Saved Only ({user.bookmarkedHackathons?.length || 0})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="section-container directory-grid-container">
        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="empty-state-card">
            <Trophy className="empty-icon" />
            <h3>No Hackathons Found</h3>
            <p>Try clearing your search query or adjusting your filters.</p>
          </div>
        ) : (
          <div className="hackathons-grid">
            {filteredList.map((h) => (
              <HackathonCard key={h._id} hackathon={h} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
