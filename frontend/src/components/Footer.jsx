import { Zap, GitBranch, Globe, Shield, Terminal } from "lucide-react";

export default function Footer({ setPage }) {
  return (
    <footer className="site-footer">
      <div className="footer-glow"></div>
      <div className="footer-container">
        <div className="footer-col brand-col">
          <div className="footer-brand" onClick={() => setPage("home")}>
            <Zap className="brand-icon" />
            <span>HACK<span className="brand-highlight">SPHERE</span></span>
          </div>
          <p className="footer-desc">
            The next-generation, high-performance platform for organizing, participating in, and judging global hackathons.
          </p>
          <div className="system-pill">
            <Terminal className="pill-icon" />
            <span>System Status: <strong className="text-emerald">All Services Operational</strong></span>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Platform Nav</h4>
          <ul className="footer-links">
            <li><button onClick={() => setPage("hackathons")}>Hackathon Directory</button></li>
            <li><button onClick={() => setPage("gallery")}>Project Showcase</button></li>
            <li><button onClick={() => setPage("leaderboard")}>Live Leaderboards</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">User Roles</h4>
          <ul className="footer-links">
            <li><span className="bullet">•</span> Administrators</li>
            <li><span className="bullet">•</span> Hackathon Organizers</li>
            <li><span className="bullet">•</span> Student Participants</li>
            <li><span className="bullet">•</span> Expert Judges</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Technology</h4>
          <p className="tech-stack-text">
            Built with MERN Architecture (MongoDB, Express, React, Node.js) with real-time evaluation matrices and role security.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="bottom-container">
          <span>© 2026 HackSphere Engine. Capstone Major Project. All Rights Reserved.</span>
          <div className="bottom-badges">
            <span className="security-tag"><Shield className="tag-icon" /> JWT Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
