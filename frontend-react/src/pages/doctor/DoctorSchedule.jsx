import { useEffect, useState } from "react";
import { DoctorAPI, SlotAPI, FALLBACK_DOCTORS, findDoctorForUser, showToast } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loading, { ErrorState, EmptyState } from "../../components/Loading";

function formatTo12Hour(time24) {
  if (!time24) return "";
  if (time24.includes("AM") || time24.includes("PM")) return time24;
  const [h, m] = time24.split(":");
  if (h === undefined || m === undefined) return time24;
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${m} ${ampm}`;
}

export default function DoctorSchedule() {
  const { user } = useAuth();
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [newSlot, setNewSlot] = useState({ startTime: "09:00", endTime: "09:30", mode: "ONLINE" });

  useEffect(() => {
    async function loadDoctorData() {
      try {
        let docs = [];
        try {
          docs = await DoctorAPI.getAll();
        } catch {
          docs = FALLBACK_DOCTORS;
        }
        if (!docs || docs.length === 0) docs = FALLBACK_DOCTORS;
        const doc = findDoctorForUser(docs, user);
        setCurrentDoctor(doc);
        if (doc) {
          setNewSlot(prev => ({ ...prev, mode: doc.mode || "ONLINE" }));
        }
      } catch (err) {
        console.error("Failed to load doctor profile:", err);
      }
    }
    loadDoctorData();
  }, [user]);

  const loadSlots = async () => {
    if (!currentDoctor) return;
    try {
      setLoading(true);
      const s = await SlotAPI.getForDoctor(currentDoctor.id, date).catch(() => []);
      setSlots(s || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentDoctor) {
      loadSlots();
    }
  }, [currentDoctor, date]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!currentDoctor) {
      showToast("Doctor profile not found", "warning");
      return;
    }
    if (!newSlot.startTime) {
      showToast("Please select Start Time", "warning");
      return;
    }
    const payload = {
      doctorId: Number(currentDoctor.id),
      doctorName: currentDoctor.name,
      date,
      startTime: formatTo12Hour(newSlot.startTime),
      endTime: newSlot.endTime ? formatTo12Hour(newSlot.endTime) : "",
      mode: currentDoctor.mode || newSlot.mode,
    };
    try {
      await SlotAPI.create(payload);
      showToast("Slot created successfully", "success");
      loadSlots();
    } catch (err) {
      showToast(err.message || "Create failed", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await SlotAPI.delete(id);
      showToast("Slot removed", "success");
      loadSlots();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const displayName = currentDoctor?.name || user.username || "Doctor";
  const docMode = currentDoctor?.mode || "ONLINE";

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)", color: "#fff", padding: "2rem 0" }}>
        <div className="page-wrapper">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 className="hero-page-title" style={{ marginBottom: ".25rem" }}>🕐 My Schedule & Slots</h1>
              <div style={{ opacity: .9, fontSize: ".95rem" }}>Manage available time slots for your consultation panel.</div>
            </div>
            <div style={{ fontSize: ".85rem", opacity: .9 }}>Logged in as <strong>{user.username}</strong></div>
          </div>
        </div>
      </section>

      <div className="page-wrapper" style={{ marginTop: "1.5rem", marginBottom: "4rem" }}>
        <div className="card card-pad" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800 }}>
                {displayName.replace("Dr.", "").trim().substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)" }}>
                  {displayName}
                </div>
                <div style={{ fontSize: ".88rem", color: "var(--text-muted)", marginTop: ".15rem" }}>
                  {currentDoctor?.specialty || "Specialist"} • <span className={`badge badge-${docMode.toLowerCase()}`}>{docMode === "ONLINE" ? "💻 Online Consultation" : "🏥 In-Clinic"}</span>
                  {currentDoctor?.clinicAddress && <span style={{ marginLeft: ".5rem" }}>📍 {currentDoctor.clinicAddress}</span>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: ".82rem", marginBottom: ".3rem" }}>Select Date</label>
                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} style={{ padding: ".45rem .85rem" }} />
              </div>
              <button className="btn btn-outline btn-sm" onClick={loadSlots} style={{ height: "38px" }}>🔄 Refresh</button>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card card-pad">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1rem" }}>Available Slots ({slots.length})</h3>
            {loading ? (
              <Loading message="Loading slots..." />
            ) : error ? (
              <ErrorState message={error} onRetry={loadSlots} />
            ) : slots.length === 0 ? (
              <EmptyState title="No slots for this date" desc="Create a new slot to open booking for your patients." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {slots.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".85rem 1rem", border: "1.5px solid var(--border)", borderRadius: "8px", background: s.available ? "#fff" : "var(--bg-subtle)" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{formatTo12Hour(s.startTime)} — {s.endTime ? formatTo12Hour(s.endTime) : ""}</div>
                      <div style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>{s.date} • <span className={`badge badge-${s.mode?.toLowerCase()}`}>{s.mode}</span> {s.available ? "• Available" : "• Booked"}</div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1rem" }}>Add New Slot</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Time <span className="req">*</span></label>
                  <input type="time" className="form-input" value={newSlot.startTime} onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })} required />
                  <div className="form-hint">Selected: <strong>{formatTo12Hour(newSlot.startTime) || "—"}</strong></div>
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-input" value={newSlot.endTime} onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })} />
                  <div className="form-hint">Selected: <strong>{newSlot.endTime ? formatTo12Hour(newSlot.endTime) : "—"}</strong></div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Consultation Mode</label>
                <select className="form-select" value={newSlot.mode} onChange={e => setNewSlot({ ...newSlot, mode: e.target.value })}>
                  <option value={docMode}>{docMode === "ONLINE" ? "💻 Online" : "🏥 Offline"}</option>
                  <option value={docMode === "ONLINE" ? "OFFLINE" : "ONLINE"}>{docMode === "ONLINE" ? "🏥 Offline" : "💻 Online"}</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-full">+ Create Slot</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
