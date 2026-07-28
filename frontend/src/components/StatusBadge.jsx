export default function StatusBadge({ status }) {
  const getBadgeStyle = () => {
    const s = String(status).toLowerCase();
    switch (s) {
      case "approved":
      case "ongoing":
      case "completed":
        return "badge-success";
      case "pending":
      case "upcoming":
      case "under_review":
        return "badge-warning";
      case "rejected":
      case "closed":
      case "blocked":
        return "badge-danger";
      default:
        return "badge-neutral";
    }
  };

  const formatText = (text) => {
    if (!text) return "N/A";
    return text.replace("_", " ").toUpperCase();
  };

  return (
    <span className={`status-badge ${getBadgeStyle()}`}>
      <span className="badge-dot"></span>
      {formatText(status)}
    </span>
  );
}
