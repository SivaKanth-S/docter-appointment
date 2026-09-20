import { Link } from "react-router-dom";

const specIcons = { Cardiology:"❤️", Neurology:"🧠", Dermatology:"✨", "General Medicine":"🩺", Orthopedics:"🦴", Pediatrics:"👶", default:"🩺" };
const avatarColors = ["#0284c7","#0d9488","#7c3aed","#d97706","#dc2626","#059669","#0ea5e9","#6366f1","#14b8a6"];

function initials(name) {
  return (name || "").replace("Dr.", "").trim().split(" ").map(w => w[0]).join("").substring(0,2).toUpperCase();
}
function fmtFee(fee) { return "₹" + (fee || 0).toLocaleString("en-IN"); }

export default function DoctorCard({ doc, idx = 0 }) {
  const col = avatarColors[idx % avatarColors.length];
  const mode = doc.mode || "ONLINE";
  const addr = doc.clinicAddress || (mode === "OFFLINE" ? "Clinic address provided on booking" : null);
  return (
    <div className="doctor-card">
      <div className="doc-card-top">
        <div className="doc-avatar-lg" style={{ background: `linear-gradient(135deg,${col},${col}cc)` }}>{initials(doc.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="doc-name">{doc.name}</div>
          <div className="doc-spec">{specIcons[doc.specialty] || specIcons.default} {doc.specialty}</div>
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            <span className={`badge badge-${mode.toLowerCase()}`}>{mode === "ONLINE" ? "💻 Online" : "🏥 In-Clinic"}</span>
            <span className="badge badge-confirmed">● Available</span>
          </div>
        </div>
      </div>
      <div className="doc-card-body">
        {doc.email && <div className="doc-info-row"><span className="ic">✉️</span>{doc.email}</div>}
        {doc.phone && <div className="doc-info-row"><span className="ic">📞</span>{doc.phone}</div>}
        {doc.availability && <div className="doc-info-row"><span className="ic">🕐</span>{doc.availability}</div>}
        {addr && <div className="doc-info-row"><span className="ic">📍</span><span>{addr}</span></div>}
      </div>
      <div className="doc-fee-row">
        <div>
          <div className="doc-fee">{fmtFee(doc.consultationFee)}</div>
          <div className="doc-fee-label">Consultation fee</div>
        </div>
        <Link to={`/book?doctorId=${doc.id}&mode=${mode}`} className="btn btn-primary btn-sm">Book →</Link>
      </div>
    </div>
  );
}
