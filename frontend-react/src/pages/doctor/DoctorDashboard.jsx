import { useEffect, useState } from "react";
import { AppointmentAPI, DoctorAPI, FALLBACK_DOCTORS, findDoctorForUser, showToast } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loading, { ErrorState, EmptyState } from "../../components/Loading";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("CONFIRMED");
  const [activeId, setActiveId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [docs, data] = await Promise.all([
        DoctorAPI.getAll().catch(() => FALLBACK_DOCTORS),
        AppointmentAPI.getAll().catch(() => []),
      ]);
      const allDocs = (docs && docs.length > 0) ? docs : FALLBACK_DOCTORS;
      const doc = findDoctorForUser(allDocs, user);
      setCurrentDoctor(doc);

      // Filter only appointments belonging to this doctor
      const myAppointments = (data || []).filter(a => {
        if (!doc) return true;
        if (a.doctorId && doc.id) return Number(a.doctorId) === Number(doc.id);
        const docClean = (doc.name || "").replace(/^Dr\.\s*/i, "").toLowerCase();
        const aDocClean = (a.doctorName || "").replace(/^Dr\.\s*/i, "").toLowerCase();
        return aDocClean.includes(docClean) || docClean.includes(aDocClean);
      });

      setAppointments(myAppointments);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const displayName = currentDoctor?.name || (user.username === "drkumar" ? "Dr. Rajesh Kumar" : user.username || "Doctor");
  const docSpecialty = currentDoctor?.specialty || "General Medicine";
  const docFee = currentDoctor?.consultationFee ? `₹${currentDoctor.consultationFee} / visit` : "₹500 / visit";
  const docMode = currentDoctor?.mode || "ONLINE";

  const filtered = filter ? appointments.filter(a => a.status === filter) : appointments;
  const queueCount = appointments.filter(a => a.status === "CONFIRMED" || a.status === "PENDING").length;
  const completedCount = appointments.filter(a => a.status === "COMPLETED").length;
  const nextSlot = appointments.find(a => a.status === "CONFIRMED")?.appointmentTime || (appointments.length > 0 ? appointments[0].appointmentTime : "10:00 AM");

  const handleStatus = async (id, status) => {
    try {
      await AppointmentAPI.updateStatus(id, status);
      showToast(`Marked as ${status}`, "success");
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)", color: "#fff", padding: "2.5rem 0" }}>
        <div className="page-wrapper">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div className="hero-breadcrumb" style={{ color: "rgba(255,255,255,.8)" }}>
                <a href="/" style={{ color: "rgba(255,255,255,.8)", textDecoration: "none" }}>Home</a> › Doctor Workspace
              </div>
              <h1 className="hero-page-title" style={{ marginBottom: ".25rem" }}>🧑‍⚕️ Physician Clinical Desk</h1>
              <div style={{ opacity: .9, fontSize: ".95rem" }}>Manage assigned patient queues, conduct video sessions, and track consults.</div>
            </div>
            <button className="btn btn-primary" style={{ background: "#fff", color: "#0f766e", fontWeight: 800 }} onClick={load}>🔄 Refresh Queue</button>
          </div>
        </div>
      </section>

      <div className="page-wrapper" style={{ marginBottom: "4rem" }}>
        {/* Logged in Doctor Profile Banner */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "var(--shadow-md)", display: "flex", alignItems: "center", gap: "1.25rem", marginTop: "-2rem", marginBottom: "2rem", border: "1px solid var(--border)" }}>
          <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", fontWeight: 800 }}>
            {displayName.replace("Dr.", "").trim().substring(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-heading)" }}>{displayName}</h2>
              <span className={`badge badge-${docMode.toLowerCase()}`}>{docMode === "ONLINE" ? "💻 Online Panel" : "🏥 In-Clinic Panel"}</span>
              <span className="badge badge-completed">Active on Duty</span>
            </div>
            <div style={{ fontSize: ".85rem", color: "var(--text-muted)", marginTop: ".25rem" }}>
              Specialty: <strong style={{ color: "var(--text-body)" }}>{docSpecialty}</strong> • Fee: <strong style={{ color: "var(--text-body)" }}>{docFee}</strong>
              {currentDoctor?.clinicAddress && <> • Clinic: <strong style={{ color: "var(--text-body)" }}>{currentDoctor.clinicAddress}</strong></>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: ".75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>Today's Queue</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0d9488" }}>{queueCount} patients</div>
          </div>
        </div>

        <div className="grid-3" style={{ marginBottom: "2rem" }}>
          <div className="stat-card">
            <div className="stat-icon-box green">👥</div>
            <div>
              <div className="stat-label">Patients in Queue</div>
              <div className="stat-value">{queueCount}</div>
              <div className="stat-sub">Scheduled for Today</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-box blue">🎉</div>
            <div>
              <div className="stat-label">Completed Consultations</div>
              <div className="stat-value">{completedCount}</div>
              <div className="stat-sub">Finished today</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-box amber">⏳</div>
            <div>
              <div className="stat-label">Next Slot Time</div>
              <div className="stat-value" style={{ fontSize: "1.4rem" }}>{nextSlot}</div>
              <div className="stat-sub">Upcoming patient</div>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: ".5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)" }}>My Patient Queue</h3>
              <p style={{ fontSize: ".85rem", color: "var(--text-muted)" }}>Real-time list of patients booked with your consultation panel.</p>
            </div>
            <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth: "140px", fontSize: ".82rem", padding: ".42rem .75rem", border: "1.5px solid var(--border)", borderRadius: "8px" }}>
              <option value="">All Patients</option>
              <option value="CONFIRMED">Confirmed / Ready</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <Loading message="Loading patient queue..." />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : filtered.length === 0 ? (
            <EmptyState title="No patients in this filter" desc="You have no appointments under this status." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {filtered.map(a => (
                <div key={a.id} className="patient-queue-card" style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: "var(--text-heading)" }}>
                      {a.patientName} <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: ".85rem" }}>• {a.appointmentDate} {a.appointmentTime}</span>
                    </div>
                    <div style={{ fontSize: ".85rem", color: "var(--text-muted)", marginTop: ".2rem" }}>
                      {docSpecialty} • <span className={`badge badge-${a.mode?.toLowerCase()}`}>{a.mode}</span> • <span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span>
                    </div>
                    <div style={{ fontSize: ".82rem", color: "var(--text-muted)", marginTop: ".3rem" }}>Reason: {a.reason}</div>
                    {a.mode === "ONLINE" && a.meetingLink && (
                      <a href={a.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: ".82rem", color: "var(--primary)", fontWeight: 700, marginTop: ".3rem", display: "inline-block" }}>
                        🔗 Join Video Room
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleStatus(a.id, "COMPLETED")}>Complete</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleStatus(a.id, "CONFIRMED")}>Confirm</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveId(a.id)}>Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeId && (() => {
          const a = appointments.find(x => x.id === activeId);
          if (!a) return null;
          return (
            <div className="modal-overlay open" onClick={() => setActiveId(null)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-head">
                  <h3>Consultation Details #{a.id}</h3>
                  <button className="modal-close" onClick={() => setActiveId(null)}>✕</button>
                </div>
                <div className="modal-body" style={{ fontSize: ".9rem", display: "flex", flexDirection: "column", gap: ".6rem" }}>
                  <div><strong>Patient:</strong> {a.patientName} {a.patientPhone && `• ${a.patientPhone}`}</div>
                  <div><strong>Doctor:</strong> {displayName} • {docSpecialty}</div>
                  <div><strong>Schedule:</strong> {a.appointmentDate} at {a.appointmentTime}</div>
                  <div><strong>Status:</strong> <span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></div>
                  <div><strong>Reason:</strong> {a.reason}</div>
                  <div><strong>Fee:</strong> ₹{a.consultationFee}</div>
                  {a.meetingLink && <div><strong>Meeting Link:</strong> <a href={a.meetingLink} target="_blank" rel="noreferrer">{a.meetingLink}</a></div>}
                  {a.clinicAddress && <div><strong>Clinic:</strong> {a.clinicAddress}</div>}
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn btn-ghost" onClick={() => setActiveId(null)}>Close</button>
                  <button type="button" className="btn btn-success" onClick={() => { handleStatus(a.id, "COMPLETED"); setActiveId(null); }}>Complete Consultation</button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
