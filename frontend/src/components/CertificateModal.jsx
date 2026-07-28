import { Award, ShieldCheck, Printer, Download, Sparkles } from "lucide-react";
import Modal from "./Modal";

export default function CertificateModal({ isOpen, onClose, recipientName, hackathonTitle, position, teamName }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Verification Certificate">
      <div className="certificate-wrapper" id="printable-certificate">
        <div className="certificate-card">
          <div className="cert-border-glow"></div>
          
          <div className="cert-header">
            <Award className="cert-icon-lg" />
            <span className="cert-org">HACKSPHERE OFFICIAL CERTIFICATE</span>
          </div>

          <h2 className="cert-title">CERTIFICATE OF ACHIEVEMENT</h2>
          <p className="cert-subtitle">This certificate is proudly awarded to</p>

          <h1 className="cert-recipient">{recipientName || "Participant"}</h1>

          <p className="cert-body-text">
            For outstanding performance and technical innovation as part of team{" "}
            <strong>"{teamName || "Hackathon Team"}"</strong> in{" "}
            <strong>"{hackathonTitle || "HackSphere 2026 Innovation Challenge"}"</strong>.
          </p>

          {position && (
            <div className="cert-award-badge">
              <Sparkles className="badge-icon" />
              <span>AWARD: {position === 1 ? "1st Place Winner" : position === 2 ? "2nd Place Winner" : position === 3 ? "3rd Place Winner" : "Honorable Mention"}</span>
            </div>
          )}

          <div className="cert-footer">
            <div className="cert-signature">
              <div className="sig-line"></div>
              <span className="sig-title">Hackathon Organizing Committee</span>
            </div>
            <div className="cert-verification">
              <ShieldCheck className="verif-icon" />
              <span className="verif-code">VERIFIED ID: HS-{Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="cert-actions">
        <button className="btn-primary-glow" onClick={handlePrint}>
          <Printer className="btn-icon" /> Print / Save PDF Certificate
        </button>
      </div>
    </Modal>
  );
}
