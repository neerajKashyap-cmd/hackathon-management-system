import { GitBranch, ExternalLink, Video, FileText, Code2, Users } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ProjectCard({ submission, onClick }) {
  return (
    <div className="project-card" onClick={() => onClick && onClick(submission)}>
      <div className="project-header">
        <div className="project-title-area">
          <h3 className="project-title">{submission.title}</h3>
          <span className="project-hackathon-name">
            {submission.hackathon?.title || "Hackathon Submission"}
          </span>
        </div>
        <StatusBadge status={submission.status || "submitted"} />
      </div>

      <p className="project-desc">
        {submission.description || submission.problemStatement || "No description provided."}
      </p>

      {/* Tech Stack tags */}
      {submission.techStack && submission.techStack.length > 0 && (
        <div className="tech-stack-row">
          {submission.techStack.map((tech, idx) => (
            <span key={idx} className="tech-pill">
              <Code2 className="pill-icon" /> {tech}
            </span>
          ))}
        </div>
      )}

      <div className="project-footer">
        <div className="author-info">
          <img
            src={
              submission.submittedBy?.avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                submission.team?.name || "Team"
              )}`
            }
            alt="Team"
            className="author-avatar"
          />
          <div className="author-details">
            <span className="team-name">{submission.team?.name || "Team Project"}</span>
            <span className="author-name">By {submission.submittedBy?.name || "Participant"}</span>
          </div>
        </div>

        <div className="project-links">
          {submission.repoLink && (
            <a
              href={submission.repoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link-btn"
              onClick={(e) => e.stopPropagation()}
              title="GitHub Repo"
            >
              <GitBranch />
            </a>
          )}
          {submission.demoLink && (
            <a
              href={submission.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link-btn"
              onClick={(e) => e.stopPropagation()}
              title="Live Demo"
            >
              <ExternalLink />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
