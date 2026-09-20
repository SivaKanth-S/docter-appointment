export function statusBadge(status) {
  const map = {
    PENDING: "badge-pending",
    CONFIRMED: "badge-confirmed",
    COMPLETED: "badge-completed",
    CANCELLED: "badge-cancelled",
    NO_SHOW: "badge-noshow",
  };
  return map[status] || "badge-pending";
}
export function modeBadge(mode) {
  return mode === "ONLINE" ? "badge-online" : "badge-offline";
}
export default function AppointmentCard({ appt, onStatusChange, onDelete, onEdit }) {
  return (
    <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem" }}>
        <strong style={{ color: "var(--text-heading)" }}>#{appt.id} — {appt.patientName}</strong>
        <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
          <span className={`badge ${modeBadge(appt.mode)}`}>{appt.mode === "ONLINE" ? "💻 Online" : "🏥 In-Clinic"}</span>
          <span className={`badge ${statusBadge(appt.status)}`}>{appt.status}</span>
        </div>
      </div>
      <div style={{ fontSize: ".88rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: ".3rem" }}>
        <div>👨‍⚕️ {appt.doctorName} {appt.specialty && `• ${appt.specialty}`}</div>
        <div>📅 {appt.appointmentDate} • {appt.appointmentTime} • ₹{appt.consultationFee}</div>
        <div>📝 {appt.reason}</div>
        {appt.mode === "ONLINE" && appt.meetingLink && (
          <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="link-pill">🔗 Join Video Room</a>
        )}
        {appt.mode === "OFFLINE" && appt.clinicAddress && (
          <div>📍 {appt.clinicAddress}</div>
        )}
      </div>
      {(onStatusChange || onDelete) && (
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".5rem" }}>
          {onStatusChange && (
            <select
              className="status-select-inline"
              value={appt.status}
              onChange={(e) => onStatusChange(appt.id, e.target.value)}
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
          )}
          {onEdit && <button className="btn btn-outline btn-sm" onClick={() => onEdit(appt)}>Edit</button>}
          {onDelete && <button className="btn btn-danger btn-sm" onClick={() => onDelete(appt.id)}>Delete</button>}
        </div>
      )}
    </div>
  );
}
