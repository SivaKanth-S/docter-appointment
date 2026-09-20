import { useEffect, useState } from "react";
import { ReportAPI, AppointmentAPI, DoctorAPI, FALLBACK_DOCTORS } from "../services/api";
import Loading, { ErrorState } from "../components/Loading";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [byMode, setByMode] = useState(null);
  const [bySpecialty, setBySpecialty] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true); setError(null);
      const [sum, appts, docs, modeData, specData, rev] = await Promise.all([
        ReportAPI.daily().catch(()=>null),
        AppointmentAPI.getAll().catch(()=>[]),
        DoctorAPI.getAll().catch(()=>FALLBACK_DOCTORS),
        ReportAPI.byMode().catch(()=>null),
        ReportAPI.bySpecialty().catch(()=>null),
        ReportAPI.revenue().catch(()=>null),
      ]);
      setSummary(sum); setAppointments(appts||[]); setDoctors(docs||[]); setByMode(modeData); setBySpecialty(specData); setRevenue(rev);
    } catch (e) { setError(e.message||"Failed to load dashboard"); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ loadDashboard(); },[]);
  const todayStr = new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  if (loading) return <div className="page-wrapper" style={{marginTop:"2rem"}}><Loading message="Loading dashboard..." /></div>;
  if (error) return <div className="page-wrapper" style={{marginTop:"2rem"}}><ErrorState message={error} onRetry={loadDashboard} /></div>;

  const totalDoctors = doctors.length;
  const totalAppts = appointments.length;
  const onlineAppts = appointments.filter(a=>a.mode==="ONLINE").length;
  const offlineAppts = appointments.filter(a=>a.mode==="OFFLINE").length;
  const pending = appointments.filter(a=>a.status==="PENDING").length;
  const confirmed = appointments.filter(a=>a.status==="CONFIRMED").length;
  const completed = appointments.filter(a=>a.status==="COMPLETED").length;
  const cancelled = appointments.filter(a=>a.status==="CANCELLED").length;

  const totalRev = revenue?.totalRevenue ?? appointments.filter(a=>a.status==="COMPLETED").reduce((s,a)=>s+(a.consultationFee||0),0) ?? 0;
  const onlineRev = revenue?.onlineRevenue ?? 0;
  const offlineRev = revenue?.offlineRevenue ?? 0;

  const modeOnlineCount = byMode?.ONLINE ?? onlineAppts;
  const modeOfflineCount = byMode?.OFFLINE ?? offlineAppts;
  const totalMode = (modeOnlineCount||0)+(modeOfflineCount||0);
  const onlinePct = totalMode?Math.round((modeOnlineCount/totalMode)*100):0;
  const offlinePct = totalMode?Math.round((modeOfflineCount/totalMode)*100):0;

  return (
    <>
      <style>{`
        .dashboard-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;margin-bottom:2rem;}
        .analytics-section-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem;}
        .chart-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:1.5rem;box-shadow:var(--shadow-sm);}
        @media(max-width:1024px){.dashboard-grid{grid-template-columns:repeat(2,1fr);}.analytics-section-grid{grid-template-columns:1fr;}}
        @media(max-width:600px){.dashboard-grid{grid-template-columns:1fr;}}
      `}</style>
      <section className="page-hero">
        <div className="page-wrapper">
          <div>
            <div className="hero-breadcrumb"><a href="/" style={{color:"rgba(255,255,255,.8)",textDecoration:"none"}}>Home</a><span> › </span>Dashboard</div>
            <h1 className="hero-page-title">📊 Operations & Revenue Analytics</h1>
            <div className="hero-page-desc">Comprehensive insights into doctor workloads, appointment mode ratios, and clinic finances.</div>
          </div>
          <div style={{fontSize:".85rem",color:"rgba(255,255,255,0.85)",textAlign:"right"}}>Today: <strong style={{color:"#fff"}}>{todayStr}</strong><br/><button className="btn btn-outline btn-sm" style={{background:"#fff",color:"var(--primary)",marginTop:".5rem"}} onClick={loadDashboard}>🔄 Refresh</button></div>
        </div>
      </section>

      <div className="page-wrapper" style={{marginTop:"2rem",marginBottom:"4rem"}}>
        <div className="dashboard-grid">
          <div className="stat-card"><div className="stat-icon-box blue">📅</div><div><div className="stat-label">Appointments</div><div className="stat-value">{summary?.totalAppointments ?? totalAppts}</div><div className="stat-sub"><span className="stat-mini" style={{background:"var(--mode-online-bg)",color:"var(--mode-online)"}}>{onlineAppts} Online</span><span className="stat-mini" style={{background:"var(--mode-offline-bg)",color:"var(--mode-offline)"}}>{offlineAppts} Offline</span></div></div></div>
          <div className="stat-card"><div className="stat-icon-box green">💰</div><div><div className="stat-label">Total Revenue</div><div className="stat-value">₹{Number(totalRev).toLocaleString("en-IN")}</div><div className="stat-sub"><span>Online: ₹{Number(onlineRev).toLocaleString("en-IN")}</span> • <span>Offline: ₹{Number(offlineRev).toLocaleString("en-IN")}</span></div></div></div>
          <div className="stat-card"><div className="stat-icon-box amber">🧑‍⚕️</div><div><div className="stat-label">Doctors</div><div className="stat-value">{summary?.totalDoctors ?? totalDoctors}</div><div className="stat-sub">{onlineAppts} online • {offlineAppts} offline mode doctors</div></div></div>
          <div className="stat-card"><div className="stat-icon-box purple">📈</div><div><div className="stat-label">Completion Rate</div><div className="stat-value">{totalAppts?Math.round((completed/totalAppts)*100):0}%</div><div className="stat-sub">{completed} completed • {pending} pending</div></div></div>
        </div>

        <div className="analytics-section-grid">
          <div className="chart-card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}><div style={{fontSize:"1.05rem",fontWeight:800,color:"var(--text-heading)"}}>Consultation Mode Distribution</div></div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".85rem",fontSize:".88rem"}}><span style={{display:"flex",alignItems:"center",gap:".5rem"}}><span style={{width:"10px",height:"10px",borderRadius:"50%",background:"var(--primary)",display:"inline-block"}}></span> Online ({modeOnlineCount})</span><strong>{onlinePct}%</strong></div>
            <div className="prog-track" style={{marginBottom:"1rem"}}><div className="prog-fill prog-blue" style={{width:`${onlinePct}%`}}></div></div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".85rem",fontSize:".88rem"}}><span style={{display:"flex",alignItems:"center",gap:".5rem"}}><span style={{width:"10px",height:"10px",borderRadius:"50%",background:"var(--secondary)",display:"inline-block"}}></span> In-Clinic ({modeOfflineCount})</span><strong>{offlinePct}%</strong></div>
            <div className="prog-track"><div className="prog-fill prog-green" style={{width:`${offlinePct}%`}}></div></div>
          </div>
          <div className="chart-card">
            <div style={{fontSize:"1.05rem",fontWeight:800,color:"var(--text-heading)",marginBottom:"1.25rem"}}>Status Lifecycle Summary</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              <div style={{textAlign:"center",padding:"1rem",background:"var(--status-pending-bg)",borderRadius:"12px"}}><div style={{fontSize:"1.6rem",fontWeight:800,color:"var(--status-pending)"}}>{pending}</div><div style={{fontSize:".75rem",fontWeight:700,textTransform:"uppercase",color:"var(--text-muted)"}}>Pending</div></div>
              <div style={{textAlign:"center",padding:"1rem",background:"var(--status-confirmed-bg)",borderRadius:"12px"}}><div style={{fontSize:"1.6rem",fontWeight:800,color:"var(--status-confirmed)"}}>{confirmed}</div><div style={{fontSize:".75rem",fontWeight:700,textTransform:"uppercase",color:"var(--text-muted)"}}>Confirmed</div></div>
              <div style={{textAlign:"center",padding:"1rem",background:"var(--status-completed-bg)",borderRadius:"12px"}}><div style={{fontSize:"1.6rem",fontWeight:800,color:"var(--status-completed)"}}>{completed}</div><div style={{fontSize:".75rem",fontWeight:700,textTransform:"uppercase",color:"var(--text-muted)"}}>Completed</div></div>
              <div style={{textAlign:"center",padding:"1rem",background:"var(--status-cancelled-bg)",borderRadius:"12px"}}><div style={{fontSize:"1.6rem",fontWeight:800,color:"var(--status-cancelled)"}}>{cancelled}</div><div style={{fontSize:".75rem",fontWeight:700,textTransform:"uppercase",color:"var(--text-muted)"}}>Cancelled</div></div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div style={{fontSize:"1.05rem",fontWeight:800,color:"var(--text-heading)",marginBottom:"1.25rem"}}>Appointments by Specialty</div>
          {(bySpecialty ? Object.entries(bySpecialty) : (()=>{ const m={}; appointments.forEach(a=>{ const k=a.specialty||"General"; m[k]=(m[k]||0)+1;}); return Object.entries(m);})()).map(([spec,count])=>{
            const pct = totalAppts?Math.round((count/totalAppts)*100):0;
            return (
              <div key={spec} style={{marginBottom:"1rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:".88rem",marginBottom:".35rem"}}><span style={{fontWeight:600}}>{spec}</span><span>{count} ({pct}%)</span></div>
                <div className="prog-track"><div className="prog-fill prog-blue" style={{width:`${pct}%`}}></div></div>
              </div>
            );
          })}
          {totalAppts===0 && <div style={{fontSize:".88rem",color:"var(--text-muted)"}}>No appointment data yet.</div>}
        </div>

        <div style={{background:"var(--bg-subtle)",border:"1px dashed var(--border-hover)",borderRadius:"12px",padding:"1.25rem",marginTop:"1.5rem"}}>
          <div style={{fontWeight:700,marginBottom:".5rem"}}>Preloaded Test Credentials</div>
          <div style={{fontSize:".85rem",color:"var(--text-muted)",display:"flex",gap:"1.5rem",flexWrap:"wrap"}}>
            <span><strong>Admin:</strong> admin / admin123</span>
            <span><strong>Doctor:</strong> drkumar / doctor123</span>
            <span><strong>Patient:</strong> john_doe / patient123</span>
          </div>
        </div>
      </div>
    </>
  );
}
