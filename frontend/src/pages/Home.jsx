import { useState, useEffect } from "react";
import api from "../services/api";
import HackathonCard from "../components/HackathonCard";
import StatCard from "../components/StatCard";
import {
  Trophy,
  Zap,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Shield,
  Code,
  Terminal,
  CheckCircle2,
  Star,
  Quote,
  Flame,
} from "lucide-react";

export default function Home({ setPage, setSelectedHackathon, onOpenAuth }) {
  const [featuredHackathons, setFeaturedHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/hackathons")
      .then((res) => {
        setFeaturedHackathons(res.data.slice(0, 3));
      })
      .catch((err) => console.error("Error loading hackathons", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id) => {
    setSelectedHackathon(id);
    setPage("hackathon-detail");
  };

  const previousWinners = [
    {
      team: "Neural Force",
      project: "Antigravity AI Coding Copilot",
      hackathon: "Global AI & MERN Innovation Summit",
      prize: "$25,000 Grand Winner",
      members: ["Neeraj Kashyap", "Elena Rostova", "Marcus Chen"],
    },
    {
      team: "Code Warriors",
      project: "Web3 Decentralized Identity Protocol",
      hackathon: "Open-Source Web3 Hackathon 2026",
      prize: "$15,000 Runner Up",
      members: ["Sarah Jenkins", "Alex Rivera", "David Miller"],
    },
    {
      team: "ByteCrafters",
      project: "Real-Time Cloud Diagnostics Engine",
      hackathon: "Enterprise Cloud Systems Challenge",
      prize: "$10,000 3rd Place",
      members: ["Judge One", "Participant Two"],
    },
  ];

  const testimonials = [
    {
      quote:
        "HackSphere streamlined our 500-developer hackathon. The 7-criteria scorecard allowed judges to evaluate projects 4x faster with total transparency.",
      name: "Sarah Jenkins",
      role: "Global Event Lead & Hackathon Director",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sarah",
    },
    {
      quote:
        "Joining a team via invite code and submitting our GitHub repo + live demo was effortless. Claiming our digital verification certificate was instant!",
      name: "Neeraj Kashyap",
      role: "Full-Stack AI Engineer & 1st Place Winner",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Neeraj",
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background-glow"></div>
        <div className="hero-grid-overlay"></div>

        <div className="hero-content">
          <div className="eyebrow-badge">
            <Sparkles className="eyebrow-icon" />
            <span>Next-Gen MERN Hackathon Platform</span>
          </div>

          <h1 className="hero-title">
            Build. Collaborate. <br />
            <span className="gradient-text">Conquer Global Hackathons.</span>
          </h1>

          <p className="hero-subtitle">
            One unified enterprise system for developers to form teams, ship cutting-edge projects,
            and compete on real-time multi-criteria leaderboards.
          </p>

          <div className="hero-cta-group">
            <button className="btn-hero-primary" onClick={() => setPage("hackathons")}>
              Explore Hackathons <ArrowRight className="btn-icon" />
            </button>
            <button className="btn-hero-secondary" onClick={() => setPage("gallery")}>
              View Project Gallery
            </button>
          </div>

          {/* Quick Terminal Code Snippet Preview */}
          <div className="hero-terminal">
            <div className="terminal-bar">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="terminal-title">hacksphere ~ bash</span>
            </div>
            <div className="terminal-body">
              <code>
                <span className="term-prompt">$</span> hacksphere init --role=developer --mode=realtime
                <br />
                <span className="term-success">✔ Initializing MERN Engine...</span>
                <br />
                <span className="term-info">ℹ 4 Roles Loaded: Admin | Organizer | Participant | Judge</span>
                <br />
                <span className="term-prompt">$</span> hacksphere status: <span className="term-highlight">READY TO SHIP 🚀</span>
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="stats-section">
        <div className="section-container">
          <div className="stats-grid">
            <StatCard
              title="ACTIVE HACKATHONS"
              value="12+"
              subtitle="Global Online & Offline Challenges"
              icon={Trophy}
              color="violet"
            />
            <StatCard
              title="REGISTERED DEVELOPERS"
              value="2,400+"
              subtitle="Full-Stack & AI Engineers"
              icon={Users}
              color="cyan"
            />
            <StatCard
              title="PROJECTS SUBMITTED"
              value="850+"
              subtitle="Open-Source Repos & Live Demos"
              icon={Code}
              color="emerald"
            />
            <StatCard
              title="TOTAL PRIZE POOL"
              value="$150,000+"
              subtitle="Awarded to Winning Teams"
              icon={Award}
              color="gold"
            />
          </div>
        </div>
      </section>

      {/* Featured Hackathons */}
      <section className="featured-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-badge"><Flame className="icon-inline text-gold" /> HOT EVENTS</span>
              <h2 className="section-title">Featured Hackathons</h2>
            </div>
            <button className="btn-secondary-link" onClick={() => setPage("hackathons")}>
              View All ({featuredHackathons.length}) <ArrowRight className="btn-icon" />
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="hackathons-grid">
              {featuredHackathons.map((h) => (
                <HackathonCard key={h._id} hackathon={h} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Previous Winners Showcase Section */}
      <section className="winners-showcase-section py-8">
        <div className="section-container">
          <div className="section-header text-center">
            <div>
              <span className="section-badge"><Trophy className="icon-inline text-gold" /> HALL OF FAME</span>
              <h2 className="section-title">Previous Hackathon Champions</h2>
            </div>
          </div>

          <div className="projects-grid mt-6">
            {previousWinners.map((w, idx) => (
              <div key={idx} className="project-card">
                <div className="project-header">
                  <div className="project-title-area">
                    <span className="badge-warning status-badge"><Star className="badge-icon" /> {w.prize}</span>
                    <h3 className="project-title mt-2">{w.team}</h3>
                    <span className="project-hackathon-name">{w.hackathon}</span>
                  </div>
                </div>
                <p className="project-desc">{w.project}</p>
                <div className="tech-stack-row">
                  {w.members.map((m, i) => (
                    <span key={i} className="tech-pill">{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Participate Section */}
      <section className="why-section">
        <div className="section-container">
          <div className="why-grid">
            <div className="why-left">
              <span className="section-badge">PLATFORM FEATURES</span>
              <h2 className="section-title">Engineered for Seamless Hackathons</h2>
              <p className="why-text">
                Traditional hackathons rely on messy forms, spreadsheets, and scattered chats. HackSphere unifies the entire lifecycle into one high-performance Web App.
              </p>

              <div className="feature-list">
                <div className="feature-item">
                  <CheckCircle2 className="feature-icon" />
                  <div>
                    <h4>Invite Code Team Builder</h4>
                    <p>Form teams instantly with unique alphanumeric invite codes, manage leadership, and add members.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <CheckCircle2 className="feature-icon" />
                  <div>
                    <h4>7-Criteria Judge Scorecards</h4>
                    <p>Judges evaluate technical complexity, UI/UX, innovation, scalability, and documentation in real time.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <CheckCircle2 className="feature-icon" />
                  <div>
                    <h4>Instant Digital Verification Certificates</h4>
                    <p>Generate downloadable digital achievement certificates for participants and prize winners.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="why-right">
              <div className="role-card-stack">
                <div className="stack-card card-admin">
                  <Shield className="stack-icon" />
                  <div>
                    <h4>Admin Console</h4>
                    <p>Manage platform users, roles, block list, system health & analytics.</p>
                  </div>
                </div>

                <div className="stack-card card-organizer">
                  <Sparkles className="stack-icon" />
                  <div>
                    <h4>Organizer Portal</h4>
                    <p>Host hackathons, approve team registrations, assign judges & declare winners.</p>
                  </div>
                </div>

                <div className="stack-card card-judge">
                  <Award className="stack-icon" />
                  <div>
                    <h4>Judging Suite</h4>
                    <p>Multi-criteria scoring sliders with inline feedback & score updates.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-8">
        <div className="section-container">
          <div className="section-header text-center">
            <div>
              <span className="section-badge"><Quote className="icon-inline text-cyan" /> COMMUNITY REVIEWS</span>
              <h2 className="section-title">Loved by Organizers & Developers</h2>
            </div>
          </div>

          <div className="dashboard-grid-layout mt-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="card-glass-panel">
                <p className="pane-paragraph">"{t.quote}"</p>
                <div className="organizer-info-card mt-4">
                  <img src={t.avatar} alt={t.name} className="org-avatar" />
                  <div>
                    <h4 className="org-name">{t.name}</h4>
                    <span className="org-label">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-container">
          <div className="cta-content">
            <h2>Ready to Host or Compete in the Next Big Hackathon?</h2>
            <p>Join thousands of engineers building the future of software right now.</p>
            <div className="cta-buttons">
              <button className="btn-hero-primary" onClick={onOpenAuth}>
                Get Started Now <Zap className="btn-icon" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
