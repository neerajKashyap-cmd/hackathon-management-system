import { Calendar, MapPin, Trophy, Users, Bookmark, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CountdownTimer from "./CountdownTimer";

export default function HackathonCard({ hackathon, onSelect }) {
  const { user, toggleBookmark } = useAuth();

  const isBookmarked = user?.bookmarkedHackathons?.some(
    (b) => (typeof b === "string" ? b : b._id) === hackathon._id
  );

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (user) {
      toggleBookmark(hackathon._id);
    }
  };

  return (
    <div className="hackathon-card" onClick={() => onSelect(hackathon._id)}>
      <div className="card-media">
        <img
          src={
            hackathon.bannerImage ||
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
          }
          alt={hackathon.title}
          className="card-banner"
        />
        <div className="card-overlay"></div>

        <div className="card-top-tags">
          <span className={`mode-badge mode-${hackathon.mode?.toLowerCase()}`}>
            {hackathon.mode || "Online"}
          </span>
          <button
            className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
            onClick={handleBookmarkClick}
            title={isBookmarked ? "Remove Bookmark" : "Save Hackathon"}
          >
            <Bookmark className="bookmark-icon" />
          </button>
        </div>

        <div className="card-prize-badge">
          <Trophy className="prize-icon" />
          <span>{hackathon.prizePool || "$10,000"}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-header-row">
          <span className="theme-tag">{hackathon.theme || "General"}</span>
          <span className="organizer-name">By {hackathon.organizer?.name || "Organizer"}</span>
        </div>

        <h3 className="card-title">{hackathon.title}</h3>
        <p className="card-tagline">{hackathon.tagline || hackathon.description?.substring(0, 100) + "..."}</p>

        <div className="card-meta">
          <div className="meta-item">
            <MapPin className="meta-icon" />
            <span>{hackathon.venue || "Virtual"}</span>
          </div>
          <div className="meta-item">
            <Users className="meta-icon" />
            <span>Max {hackathon.maxTeamSize || 4} / Team</span>
          </div>
        </div>

        <div className="card-footer-row">
          <CountdownTimer targetDate={hackathon.registrationDeadline} />
          <button className="btn-card-action">
            View Hackathon <ArrowRight className="btn-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}
