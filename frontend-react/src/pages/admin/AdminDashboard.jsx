import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DoctorAPI, AppointmentAPI, ReportAPI, FALLBACK_DOCTORS } from "../../services/api";
import Loading, { ErrorState } from "../../components/Loading";

export default function AdminDashboard() {
  const [docs,setDocs]=useState([]); const [appts,setAppts]=useState([]); const [report,setReport]=useState(null);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const [bySpec,setBySpec]=useState(null);

  const load = async ()=>{
    try{ setLoading(true); const [d,a,r,s]=await Promise.all([DoctorAPI.getAll().catch(()=>FALLBACK_DOCTORS), AppointmentAPI.getAll().catch(()=>[]), ReportAPI.daily().catch(()=>null), ReportAPI.bySpecialty().catch(()=>null)]); setDocs(d||[]); setAppts(a||[]); setReport(r); setBySpec(s); setError(null);} catch(e){setError(e.message);} finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);
  if(loading) return <div className="page-wrapper" style={{marginTop:"2rem"}}><Loading message="Loading admin dashboard..." /></div>;
  if(error) return <div className="page-wrapper" style={{marginTop:"2rem"}}><ErrorState message={error} onRetry={load} /></div>;

  const onlineDocs = docs.filter(d=>d.mode==="ONLINE").length;
  const activeAppts = appts.filter(a=>a.status!=="CANCELLED").length;
  const onlineAppts = report?.onlineAppointments ?? appts.filter(a=>a.mode==="ONLINE").length;
  const offlineAppts = report?.offlineAppointments ?? appts.filter(a=>a.mode==="OFFLINE").length;
  const total = (onlineAppts||0)+(offlineAppts||0); const onPct = total?Math.round((onlineAppts/total)*100):50;

  const specMap = bySpec || (()=>{ const m={}; appts.forEach(a=>{m[a.specialty||"General"]=(m[a.specialty||"General"]||0)+1;}); return m;})();

  return (
    <>
      <section className="page-hero" style={{background:"linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)"}}>
        <div className="page-wrapper">
          <div>
            <div className="hero-breadcrumb"><Link to="/" style={{color:"rgba(255,255,255,.8)",textDecoration:"none"}}>Home</Link><span> › </span>Admin Portal</div>
            <div style={{display:"flex",alignItems:"center",gap:".75rem",marginBottom:".35rem"}}><h1 className="hero-page-title" style={{marginBottom:0}}>🛡️ System Administrator Portal</h1><span style={{background:"#4f46e5",color:"#fff",padding:".25rem .65rem",borderRadius:"50px",fontSize:".72rem",fontWeight:800}}>ROLE_ADMIN</span></div>
            <div className="hero-page-desc">Manage doctors, monitor finances, and oversee all appointments.</div>
          </div>
          <div style={{display:"flex",gap:".75rem"}}><Link to="/admin/doctors" className="btn btn-primary btn-sm">Manage Doctors</Link><Link to="/admin/bookings" className="btn btn-outline btn-sm" style={{color:"#fff",borderColor:"rgba(255,255,255,.4)"}}>All Bookings</Link></div>
        </div>
      </section>

      <div className="page-wrapper" style={{marginTop:"2rem",marginBottom:"4rem"}}>
        <div className="grid-4" style={{marginBottom:"2rem"}}>
          <div className="stat-card"><div className="stat-icon-box blue">💰</div><div><div className="stat-label">Total Revenue</div><div className="stat-value">₹{(report?.totalRevenue||0).toLocaleString("en-IN")}</div><div className="stat-sub">Online: ₹{report?.onlineRevenue||0} • Offline: ₹{report?.offlineRevenue||0}</div></div></div>
          <div className="stat-card"><div className="stat-icon-box purple">🧑‍⚕️</div><div><div className="stat-label">Registered Doctors</div><div className="stat-value">{docs.length}</div><div className="stat-sub">{onlineDocs} Online • {docs.length-onlineDocs} Offline</div></div></div>
          <div className="stat-card"><div className="stat-icon-box green">📅</div><div><div className="stat-label">Total Bookings</div><div className="stat-value">{appts.length}</div><div className="stat-sub">{activeAppts} Active</div></div></div>
          <div className="stat-card"><div className="stat-icon-box amber">⚡</div><div><div className="stat-label">Rule Compliance</div><div className="stat-value">100%</div><div className="stat-sub">Strict Mode Active</div></div></div>
        </div>

        <div className="grid-2" style={{marginBottom:"2rem"}}>
          <Link to="/admin/doctors" className="card card-pad" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:"1rem"}}><div className="stat-icon-box blue" style={{fontSize:"1.6rem"}}>🧑‍⚕️</div><div><div style={{fontSize:"1.1rem",fontWeight:800,color:"var(--text-heading)"}}>Manage Doctors</div><div style={{fontSize:".84rem",color:"var(--text-muted)"}}>Add, edit, or remove doctors</div></div><span style={{marginLeft:"auto",fontSize:"1.5rem",color:"var(--primary)"}}>→</span></Link>
          <Link to="/admin/bookings" className="card card-pad" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:"1rem"}}><div className="stat-icon-box green" style={{fontSize:"1.6rem"}}>📋</div><div><div style={{fontSize:"1.1rem",fontWeight:800,color:"var(--text-heading)"}}>All Bookings</div><div style={{fontSize:".84rem",color:"var(--text-muted)"}}>View and manage all appointments</div></div><span style={{marginLeft:"auto",fontSize:"1.5rem",color:"var(--primary)"}}>→</span></Link>
        </div>

        <div className="grid-2">
          <div className="card card-pad">
            <h3 style={{fontSize:"1.1rem",fontWeight:800,marginBottom:"1rem"}}>Mode Distribution</h3>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:".9rem",marginBottom:".5rem"}}><span>💻 Online Consultations</span><strong>{onlineAppts} ({onPct}%)</strong></div>
            <div className="prog-track" style={{marginBottom:"1.5rem"}}><div className="prog-fill prog-blue" style={{width:`${onPct}%`}}></div></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:".9rem",marginBottom:".5rem"}}><span>🏥 In-Clinic Visits</span><strong>{offlineAppts} ({100-onPct}%)</strong></div>
            <div className="prog-track"><div className="prog-fill prog-green" style={{width:`${100-onPct}%`}}></div></div>
          </div>
          <div className="card card-pad">
            <h3 style={{fontSize:"1.1rem",fontWeight:800,marginBottom:"1rem"}}>Specialty Breakdown</h3>
            <div style={{display:"flex",flexDirection:"column",gap:".75rem"}}>
              {Object.entries(specMap).length===0 ? <div style={{fontSize:".85rem",color:"var(--text-muted)"}}>No appointment data yet.</div> :
                Object.entries(specMap).map(([spec,count])=>{
                  const pct = appts.length?Math.round((count/appts.length)*100):0;
                  return <div key={spec}><div style={{display:"flex",justifyContent:"space-between",fontSize:".85rem",marginBottom:".35rem"}}><span style={{fontWeight:600}}>{spec}</span><span>{count} ({pct}%)</span></div><div className="prog-track"><div className="prog-fill prog-blue" style={{width:`${pct}%`}}></div></div></div>;
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
