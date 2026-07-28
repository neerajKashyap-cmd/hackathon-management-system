import { useState, useEffect } from "react";
import api from "../services/api";
import ProjectCard from "../components/ProjectCard";
import { Grid, Search, Code2 } from "lucide-react";

export default function PublicGallery() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");

  useEffect(() => {
    fetchGallery();
  }, [search]);

  const fetchGallery = () => {
    setLoading(true);
    let url = `/submissions/gallery?search=${encodeURIComponent(search)}`;
    api
      .get(url)
      .then((res) => {
        setSubmissions(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const allTechStacks = ["All", "React", "Node.js", "Express", "MongoDB", "Python", "Tailwind CSS"];

  const filtered = selectedTech === "All"
    ? submissions
    : submissions.filter((s) => s.techStack?.includes(selectedTech));

  return (
    <div className="section-container public-gallery-page">
      <div className="page-header text-center">
        <span className="section-badge"><Grid className="badge-icon" /> PROJECT GALLERY</span>
        <h1 className="page-title">Hackathon Showcase</h1>
        <p className="page-subtitle">
          Explore real-world projects built by developer teams worldwide.
        </p>

        <div className="search-filter-wrapper mt-8">
          <div className="search-input-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search project titles, descriptions, or tech stacks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="tech-filter-pills-row mt-4">
            {allTechStacks.map((tech) => (
              <button
                key={tech}
                className={`filter-pill ${selectedTech === tech ? "active" : ""}`}
                onClick={() => setSelectedTech(tech)}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state-card mt-8">
          <Grid className="empty-icon" />
          <h3>No Projects Found</h3>
          <p>Try searching for a different keyword or tech stack.</p>
        </div>
      ) : (
        <div className="projects-grid mt-8">
          {filtered.map((sub) => (
            <ProjectCard key={sub._id} submission={sub} />
          ))}
        </div>
      )}
    </div>
  );
}
