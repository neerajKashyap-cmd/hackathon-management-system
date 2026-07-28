export default function StatCard({ title, value, subtitle, icon: Icon, color = "violet" }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon-badge">
            <Icon className="stat-icon" />
          </div>
        )}
      </div>
      <div className="stat-value-row">
        <span className="stat-value">{value}</span>
      </div>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </div>
  );
}
