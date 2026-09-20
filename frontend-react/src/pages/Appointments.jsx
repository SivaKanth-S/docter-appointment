import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppointmentAPI, showToast, formatTimeAMPM } from "../services/api";
import Loading, { ErrorState, EmptyState } from "../components/Loading";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusTab, setStatusTab] = useState("ALL");
  const [q, setQ] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [editing, setEditing] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true); setError(null);
      const data = await AppointmentAPI.getAll();
      setAppointments(data||[]);
    } catch (e) { setError(e.message||"Failed to load appointments"); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ loadAppointments(); },[]);

  const filtered = appointments.filter(a=>{
    const matchStatus = statusTab==="ALL" || a.status===statusTab;
    const matchMode = !modeFilter || a.mode===modeFilter;
    const qq = q.toLowerCase();
    const matchQ = !q || a.patientName.toLowerCase().includes(qq) || a.doctorName.toLowerCase().includes(qq) || (a.specialty||"").toLowerCase().includes(qq);
    return matchStatus && matchMode && matchQ;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await AppointmentAPI.updateStatus(id, newStatus);
      showToast("Appointment status updated successfully!","success");
      loadAppointments();
    } catch (e) { showToast(e.message||"Status update failed","error"); }
  };
  const handleDelete = async (id) => {
    if (!confirm("Delete this appointment?")) return;
    try { await AppointmentAPI.delete(id); showToast("Appointment deleted","success"); loadAppointments(); }
    catch (e){ showToast(e.message||"Delete failed","error"); }
  };
  const handleEditSave = async (e) => {
    e.preventDefault();
    const payload = { ...editing, appointmentTime: formatTimeAMPM(editing.appointmentTime) };
    try { await AppointmentAPI.update(editing.id, payload); showToast("Appointment updated","success"); setEditing(null); loadAppointments(); }
    catch(err){ showToast(err.message||"Update failed","error"); }
  };

  return (
    <>
      <style>{`
        .filter-tabs{display:flex;gap:.5rem;overflow-x:auto;padding-bottom:.5rem;margin-bottom:1rem;}
        .filter-tab-btn{padding:.5rem 1rem;font-size:.85rem;font-weight:700;border-radius:8px;border:1.5px solid var(--border);background:#fff;cursor:pointer;white-space:nowrap;transition:var(--transition);color:var(--text-muted);}
        .filter-tab-btn.active{background:var(--primary);border-color:var(--primary);color:#fff;box-shadow:0 2px 6px rgba(2,132,199,.25);}
        .actions-cell{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;}
        .status-select-inline{padding:.3rem .5rem;font-size:.78rem;font-weight:700;border-radius:6px;border:1.5px solid var(--border);cursor:pointer;background:#fff;outline:none;}
        .link-pill{display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .6rem;background:var(--primary-subtle);border:1px solid #bfdbfe;color:var(--primary-dark);font-size:.75rem;font-weight:700;border-radius:4px;text-decoration:none;}
      `}</style>
      <section className="page-hero">
        <div className="page-wrapper">
          <div>
            <div className="hero-breadcrumb"><Link to="/" style={{color:"rgba(255,255,255,.8)",textDecoration:"none"}}>Home</Link><span> › </span>Appointments</div>
            <h1 className="hero-page-title">📋 Appointment Tracking</h1>
            <div className="hero-page-desc">Track status, join video sessions, manage bookings, and view clinic locations.</div>
          </div>
          <div><Link to="/book" className="btn btn-primary" style={{background:"#fff",color:"var(--primary)",fontWeight:800}}>📅 Book Appointment</Link></div>
        </div>
      </section>

      <div className="page-wrapper" style={{marginTop:"1.5rem",marginBottom:"4rem"}}>
        <div className="filter-tabs">
          {["ALL","PENDING","CONFIRMED","COMPLETED","CANCELLED","NO_SHOW"].map(s=>(
            <button key={s} className={`filter-tab-btn ${statusTab===s?"active":""}`} onClick={()=>setStatusTab(s)}>{s==="ALL"?"All Appointments": s==="NO_SHOW"?"⚠️ No Show": s}</button>
          ))}
        </div>
        <div className="filter-bar">
          <div className="search-wrap"><span className="search-icon">🔍</span><input type="text" placeholder="Search by patient name, doctor or specialty..." value={q} onChange={e=>setQ(e.target.value)} /></div>
          <select className="form-select" value={modeFilter} onChange={e=>setModeFilter(e.target.value)} style={{minWidth:"150px",padding:".42rem .75rem",border:"1.5px solid var(--border)",borderRadius:"8px"}}>
            <option value="">All Modes</option><option value="ONLINE">💻 Online Only</option><option value="OFFLINE">🏥 In-Clinic Only</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={loadAppointments}>🔄 Refresh Data</button>
        </div>

        {loading ? <Loading message="Loading appointments..." /> : error ? <ErrorState message={error} onRetry={loadAppointments} /> : filtered.length===0 ? <EmptyState icon="📭" title="No appointments" desc={q||statusTab!=="ALL"?"Try adjusting filters.":"No bookings yet. Book your first appointment!"} /> : (
          <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Patient</th><th>Doctor & Specialty</th><th>Mode</th><th>Date & Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(a=>(
                    <tr key={a.id}>
                      <td>#{a.id}</td>
                      <td><div style={{fontWeight:700,color:"var(--text-heading)"}}>{a.patientName}</div><div style={{fontSize:".75rem",color:"var(--text-muted)"}}>{a.patientEmail||""}</div></td>
                      <td><div style={{fontWeight:600}}>{a.doctorName}</div><div style={{fontSize:".75rem",color:"var(--text-muted)"}}>{a.specialty}</div></td>
                      <td><span className={`badge badge-${a.mode?.toLowerCase()}`}>{a.mode==="ONLINE"?"💻 Online":"🏥 Offline"}</span></td>
                      <td>{a.appointmentDate} <br/><span style={{fontSize:".78rem",color:"var(--text-muted)"}}>{formatTimeAMPM(a.appointmentTime)}</span></td>
                      <td>
                        <select className="status-select-inline" value={a.status} onChange={e=>handleStatusChange(a.id,e.target.value)}>
                          <option value="PENDING">PENDING</option><option value="CONFIRMED">CONFIRMED</option><option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option><option value="NO_SHOW">NO_SHOW</option>
                        </select>
                        <div style={{marginTop:".3rem"}}><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></div>
                      </td>
                      <td>
                        <div className="actions-cell">
                          {a.mode==="ONLINE" && a.meetingLink && <a href={a.meetingLink} target="_blank" rel="noreferrer" className="link-pill">🔗 Join</a>}
                          <button className="btn btn-outline btn-sm" onClick={()=>setEditing(a)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(a.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}

        {editing && (
          <div className="modal-overlay open" onClick={()=>setEditing(null)}>
            <div className="modal-box" onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><h3>Edit Appointment #{editing.id}</h3><button className="modal-close" onClick={()=>setEditing(null)}>✕</button></div>
              <form onSubmit={handleEditSave}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Patient Name</label><input className="form-input" value={editing.patientName} onChange={e=>setEditing({...editing, patientName:e.target.value})} required /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={editing.appointmentDate} onChange={e=>setEditing({...editing, appointmentDate:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Time <span className="req">*</span></label><input className="form-input" placeholder="e.g. 10:00 AM" value={editing.appointmentTime} onChange={e=>setEditing({...editing, appointmentTime:e.target.value})} required /><div className="form-hint">e.g. 10:00 AM or 02:30 PM</div></div>
                  </div>
                  <div className="form-group"><label className="form-label">Reason</label><textarea className="form-textarea" value={editing.reason} onChange={e=>setEditing({...editing, reason:e.target.value})} /></div>
                </div>
                <div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={()=>setEditing(null)}>Cancel</button><button type="submit" className="btn btn-primary">Update</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
