import { useEffect, useState } from "react";
import { AppointmentAPI, showToast } from "../../services/api";
import Loading, { ErrorState, EmptyState } from "../../components/Loading";

export default function AdminBookings() {
  const [appts,setAppts]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const [statusFilter,setStatusFilter]=useState(""); const [modeFilter,setModeFilter]=useState(""); const [q,setQ]=useState("");

  const load = async ()=>{
    try{ setLoading(true); const data=await AppointmentAPI.getAll(); setAppts(data||[]); setError(null);} catch(e){ setError(e.message);} finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);

  const filtered = appts.filter(a=>{
    const matchStatus=!statusFilter||a.status===statusFilter;
    const matchMode=!modeFilter||a.mode===modeFilter;
    const qq=q.toLowerCase();
    const matchQ=!q||a.patientName.toLowerCase().includes(qq)||a.doctorName.toLowerCase().includes(qq);
    return matchStatus&&matchMode&&matchQ;
  });

  const handleStatus = async (id,status)=>{
    try{ await AppointmentAPI.updateStatus(id,status); showToast("Status updated","success"); load(); } catch(e){ showToast(e.message,"error");}
  };
  const handleDelete = async (id)=>{
    if(!confirm("Delete appointment?")) return;
    try{ await AppointmentAPI.delete(id); showToast("Deleted","success"); load();} catch(e){ showToast(e.message,"error");}
  };

  return (
    <>
      <section className="page-hero" style={{background:"linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)"}}>
        <div className="page-wrapper">
          <div>
            <div className="hero-breadcrumb"><a href="/admin/dashboard" style={{color:"rgba(255,255,255,.8)",textDecoration:"none"}}>Admin Portal</a><span> › </span>All Bookings</div>
            <h1 className="hero-page-title">📋 All Appointment Bookings</h1>
            <div className="hero-page-desc">Oversee every patient booking, update lifecycle status, and manage cancellations.</div>
          </div>
          <div style={{display:"flex",gap:".5rem"}}><span className="badge badge-confirmed">{appts.length} Total</span><button className="btn btn-outline btn-sm" style={{color:"#fff",borderColor:"rgba(255,255,255,.4)"}} onClick={load}>🔄 Refresh</button></div>
        </div>
      </section>

      <div className="page-wrapper" style={{marginTop:"1.5rem",marginBottom:"4rem"}}>
        <div className="filter-bar">
          <div className="search-wrap"><span className="search-icon">🔍</span><input placeholder="Search patient or doctor..." value={q} onChange={e=>setQ(e.target.value)} /></div>
          <select className="form-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{minWidth:"160px",padding:".42rem .75rem",border:"1.5px solid var(--border)",borderRadius:"8px"}}><option value="">All Statuses</option><option value="PENDING">PENDING</option><option value="CONFIRMED">CONFIRMED</option><option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option><option value="NO_SHOW">NO_SHOW</option></select>
          <select className="form-select" value={modeFilter} onChange={e=>setModeFilter(e.target.value)} style={{minWidth:"150px",padding:".42rem .75rem",border:"1.5px solid var(--border)",borderRadius:"8px"}}><option value="">All Modes</option><option value="ONLINE">💻 Online</option><option value="OFFLINE">🏥 Offline</option></select>
        </div>

        {loading ? <Loading message="Loading bookings..." /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length===0 ? <EmptyState title="No bookings found" desc="Try adjusting filters." /> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Mode</th><th>Date & Time</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(a=>(
                  <tr key={a.id}>
                    <td>#{a.id}</td>
                    <td><div style={{fontWeight:700}}>{a.patientName}</div><div style={{fontSize:".75rem",color:"var(--text-muted)"}}>{a.patientEmail||""}</div></td>
                    <td><div>{a.doctorName}</div><div style={{fontSize:".75rem",color:"var(--text-muted)"}}>{a.specialty}</div></td>
                    <td><span className={`badge badge-${a.mode?.toLowerCase()}`}>{a.mode}</span></td>
                    <td>{a.appointmentDate}<br/><span style={{fontSize:".78rem",color:"var(--text-muted)"}}>{a.appointmentTime}</span></td>
                    <td>₹{a.consultationFee}</td>
                    <td><select value={a.status} onChange={e=>handleStatus(a.id,e.target.value)} style={{padding:".3rem",borderRadius:"6px",border:"1.5px solid var(--border)",fontSize:".78rem",fontWeight:700}}><option value="PENDING">PENDING</option><option value="CONFIRMED">CONFIRMED</option><option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option><option value="NO_SHOW">NO_SHOW</option></select></td>
                    <td><button className="btn btn-danger btn-sm" onClick={()=>handleDelete(a.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
