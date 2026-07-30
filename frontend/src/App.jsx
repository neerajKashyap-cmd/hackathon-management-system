import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Modal from "./components/Modal";

// Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Hackathons from "./pages/Hackathons";
import HackathonDetail from "./pages/HackathonDetail";
import Leaderboard from "./pages/Leaderboard";
import PublicGallery from "./pages/PublicGallery";
import NotFound from "./pages/NotFound";

// Role Dashboards
import AdminDashboard from "./pages/Dashboards/AdminDashboard";
import OrganizerDashboard from "./pages/Dashboards/OrganizerDashboard";
import ParticipantDashboard from "./pages/Dashboards/ParticipantDashboard";
import JudgeDashboard from "./pages/Dashboards/JudgeDashboard";

import "./App.css";

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState("home");
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Automatically sync active page route when logged-in user changes role or logs out
  useEffect(() => {
    if (user && user.role) {
      if (["home", "dashboard", "organizer", "judge", "admin"].includes(page)) {
        if (user.role === "admin" && page !== "admin") setPage("admin");
        else if (user.role === "organizer" && page !== "organizer") setPage("organizer");
        else if (user.role === "judge" && page !== "judge") setPage("judge");
        else if (user.role === "participant" && page !== "dashboard") setPage("dashboard");
      }
    } else if (!user) {
      if (["dashboard", "organizer", "judge", "admin", "profile"].includes(page)) {
        setPage("home");
      }
    }
  }, [user, page]);

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (user?.role === "admin") setPage("admin");
    else if (user?.role === "organizer") setPage("organizer");
    else if (user?.role === "judge") setPage("judge");
    else setPage("dashboard");
  };

  return (
    <div className="app-shell">
      <Navbar
        currentPage={page}
        setPage={setPage}
        onOpenAuth={handleOpenAuth}
      />

      <main className="main-content">
        {page === "home" && (
          <Home
            setPage={setPage}
            setSelectedHackathon={setSelectedHackathon}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {page === "hackathons" && (
          <Hackathons
            setPage={setPage}
            setSelectedHackathon={setSelectedHackathon}
          />
        )}

        {page === "hackathon-detail" && (
          <HackathonDetail
            hackathonId={selectedHackathon}
            setPage={setPage}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {page === "leaderboard" && <Leaderboard />}

        {page === "gallery" && <PublicGallery />}

        {page === "profile" && (
          <Profile
            setPage={setPage}
            setSelectedHackathon={setSelectedHackathon}
          />
        )}

        {/* Dashboards */}
        {page === "dashboard" && (
          <ParticipantDashboard
            setPage={setPage}
            setSelectedHackathon={setSelectedHackathon}
          />
        )}

        {page === "organizer" && (
          <OrganizerDashboard
            setPage={setPage}
            setSelectedHackathon={setSelectedHackathon}
          />
        )}

        {page === "judge" && <JudgeDashboard />}

        {page === "admin" && <AdminDashboard />}

        {![
          "home",
          "hackathons",
          "hackathon-detail",
          "leaderboard",
          "gallery",
          "profile",
          "dashboard",
          "organizer",
          "judge",
          "admin",
        ].includes(page) && <NotFound setPage={setPage} />}
      </main>

      <Footer setPage={setPage} />

      {/* Auth Dialog Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title=""
      >
        <Auth onSuccess={handleAuthSuccess} />
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
