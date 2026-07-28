import { AlertTriangle, Home } from "lucide-react";

export default function NotFound({ setPage }) {
  return (
    <div className="section-container not-found-page">
      <div className="not-found-card text-center">
        <AlertTriangle className="error-icon-lg" />
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page / Route Not Found</h2>
        <p className="error-desc">
          The requested hackathon module or page location does not exist on this platform.
        </p>

        <button className="btn-primary-glow mt-6" onClick={() => setPage("home")}>
          <Home className="btn-icon" /> Return to Home Dashboard
        </button>
      </div>
    </div>
  );
}
