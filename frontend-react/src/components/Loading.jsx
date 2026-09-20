export default function Loading({ message = "Loading..." }) {
  return (
    <div className="state-box"><div className="spinner"></div>{message}</div>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box">
      <div className="state-icon">❌</div>
      <div className="state-title">Failed to load</div>
      <div className="state-desc">{message}</div>
      {onRetry && <button className="btn btn-outline btn-sm" style={{ marginTop: "1rem" }} onClick={onRetry}>Retry</button>}
    </div>
  );
}
export function EmptyState({ icon = "📭", title = "No data", desc = "" }) {
  return (
    <div className="state-box">
      <div className="state-icon">{icon}</div>
      <div className="state-title">{title}</div>
      {desc && <div className="state-desc">{desc}</div>}
    </div>
  );
}
