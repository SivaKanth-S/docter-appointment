import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppointmentAPI, showToast } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loading, { ErrorState, EmptyState } from "../../components/Loading";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments,setAppointments]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(null);

  const load = async ()=>{
    try{ setLoading(true); const all=await AppointmentAPI.getAll(); setAppointments(all||[]); setError(null);} catch(e){ setError(e.message); setAppointments([]);} finally{setLoading(false);}
  };
  useEffect(()=>{ load(); },[]);

  // Show all for demo; in production would filter by patient email
  const displayName = user.username==="john_doe" ? "John Doe" : (user.username||"Patient");
  // naive filter: if name matches, show only those; otherwise show all to demonstrate functionality
  let filtered = appointments.filter(a=>a.patientName.toLowerCase().includes(displayName.toLowerCase()));
  if (filtered.length===0) filtered = appointments;

  const upcoming = filtered.filter(a=>a.status==="CONFIRMED"||a.status==="PENDING");
  const past = filtered.filter(a=>a.status==="COMPLETED"||a.status==="CANCELLED"||a.status==="NO_SHOW");

  const cancelBooking = async (id)=>{
    if (!confirm("Cancel this appointment?")) return;
    try{ await AppointmentAPI.cancel(id); showToast("Appointment cancelled","success"); load(); } catch(e){ showToast(e.message,"error");}
  };

  return (
    <>
      <section style={{background:"linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)",color:"#fff",padding:"2.5rem 0"}}>
        <div className="page-wrapper">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem"}}>
            <div><div className="hero-breadcrumb" style={{color:"rgba(255,255,255,.8)"}}><a href="/" style={{color:"rgba(255,255,255,.8)",textDecoration:"none"}}>Home</a> › Patient Portal</div><h1 className="hero-page-title" style={{marginBottom:".25rem"}}>👋 Hello, {displayName}</h1><div style={{opacity:.9,fontSize:".95rem"}}>Manage your upcoming consultations, launch telehealth calls, and view medical appointments.</div></div>
            <Link to="/book" className="btn btn-primary btn-lg" style={{background:"#fff",color:"var(--primary)",fontWeight:800,boxShadow:"0 4px 12px rgba(0,0,0,.15)"}}>📅 Book Consultation</Link>
          </div>
        </div>
      </section>

      <div className="page-wrapper" style={{marginTop:"2rem",marginBottom:"4rem"}}>
        <div className="grid-3" style={{marginBottom:"2rem"}}>
          <div className="stat-card"><div className="stat-icon-box blue">📅</div><div><div className="stat-label">Upcoming Visits</div><div className="stat-value">{upcoming.length}</div><div className="stat-sub">Active bookings</div></div></div>
          <div className="stat-card"><div className="stat-icon-box green">✅</div><div><div className="stat-label">Completed Consults</div><div className="stat-value">{past.filter(a=>a.status==="COMPLETED").length}</div><div className="stat-sub">Past check-ups</div></div></div>
          <div className="stat-card"><div className="stat-icon-box purple">💳</div><div><div className="stat-label">Consultation Mode</div><div className="stat-value" style={{fontSize:"1.2rem",marginTop:".3rem"}}>Online & Offline</div><div className="stat-sub">Dedicated doctors</div></div></div>
        </div>

        {loading ? <Loading message="Loading your appointments..." /> : error ? <ErrorState message={error} onRetry={load} /> : (
          <div className="grid-2" style={{alignItems:"start"}}>
            <div>
              <h3 style={{fontSize:"1.25rem",fontWeight:800,color:"var(--text-heading)",marginBottom:"1rem"}}>Upcoming Appointments</h3>
              {upcoming.length===0 ? <div className="state-box"><div className="state-icon">📅</div><div className="state-title">No Upcoming Appointments</div><div className="state-desc">You do not have any pending doctor visits scheduled.</div><Link to="/book" className="btn btn-primary btn-sm" style={{marginTop:"1rem"}}>Book an Appointment</Link></div> :
                upcoming.map(a=>(
                  <div key={a.id} className="card card-pad" style={{marginBottom:"1.25rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:".5rem"}}>
                      <div><h4 style={{fontSize:"1.1rem",fontWeight:800,color:"var(--text-heading)",marginBottom:".2rem"}}>{a.doctorName}</h4><div style={{fontSize:".84rem",color:"var(--primary)",fontWeight:700}}>{a.specialty}</div></div>
                      <div style={{textAlign:"right"}}><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span><div style={{fontSize:".95rem",fontWeight:800,color:"var(--text-heading)",marginTop:".25rem"}}>₹{a.consultationFee||0}</div></div>
                    </div>
                    <div style={{fontSize:".85rem",color:"var(--text-muted)",marginTop:".75rem"}}>📅 Scheduled for <strong>{a.appointmentDate}</strong> at <strong>{a.appointmentTime}</strong></div>
                    <div style={{fontSize:".82rem",color:"var(--text-muted)",marginTop:".2rem"}}>Reason: <em>{a.reason||"General Consultation"}</em></div>
                    {a.mode==="ONLINE" ? (
                      <div style={{background:"var(--primary-subtle)",border:"1.5px solid #bfdbfe",borderRadius:"12px",padding:"1rem 1.25rem",display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"1rem",flexWrap:"wrap",gap:".75rem"}}>
                        <div><div style={{fontWeight:700,color:"var(--primary)",fontSize:".85rem"}}>💻 Online Video Telehealth</div><div style={{fontSize:".75rem",color:"var(--text-muted)"}}>Click to launch your private room</div></div>
                        <a href={a.meetingLink||`https://telehealth.mediconnect.org/room/${a.id}`} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Join Video Room →</a>
                      </div>
                    ) : (
                      <div style={{background:"var(--secondary-light)",border:"1.5px solid #a7f3d0",borderRadius:"12px",padding:"1rem 1.25rem",marginTop:"1rem"}}>
                        <div style={{fontWeight:700,color:"var(--secondary)",fontSize:".85rem"}}>🏥 In-Clinic Physical Visit</div>
                        <div style={{fontSize:".82rem",color:"var(--text-heading)",fontWeight:600,marginTop:"2px"}}>📍 {a.clinicAddress||"Apollo Heart Center, Greams Road, Cabin 204"}</div>
                        <div style={{fontSize:".75rem",color:"var(--text-muted)",marginTop:"2px"}}>Please arrive 10 mins before your scheduled time.</div>
                      </div>
                    )}
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:"1rem"}}><button className="btn btn-danger btn-sm" onClick={()=>cancelBooking(a.id)}>Cancel Appointment</button></div>
                  </div>
                ))}
            </div>
            <div>
              <h3 style={{fontSize:"1.25rem",fontWeight:800,color:"var(--text-heading)",marginBottom:"1rem"}}>Appointment History</h3>
              {past.length===0 ? <div className="state-box"><div className="state-icon">📭</div><div className="state-title">No history yet</div><div className="state-desc">Completed or cancelled appointments will appear here.</div></div> :
                past.map(a=>(
                  <div key={a.id} className="card card-pad" style={{marginBottom:"1rem",opacity:.95}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}><strong>{a.doctorName}</strong><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></div>
                    <div style={{fontSize:".82rem",color:"var(--text-muted)",marginTop:".3rem"}}>{a.specialty} • {a.appointmentDate} {a.appointmentTime} • ₹{a.consultationFee}</div>
                    <div style={{fontSize:".82rem",color:"var(--text-muted)"}}>{a.reason}</div>
                  </div>
                ))}
              <div className="card card-pad" style={{marginTop:"1.5rem",background:"linear-gradient(135deg, #f0fdf4, #dcfce7)",borderColor:"#86efac"}}>
                <h4 style={{fontWeight:800,color:"#166534",marginBottom:".5rem"}}>💡 Patient Preparation Checklist</h4>
                <ul style={{fontSize:".84rem",color:"#14532d",display:"flex",flexDirection:"column",gap:".4rem",paddingLeft:"1.2rem"}}>
                  <li>For <strong>Online video consultations</strong>, ensure microphone and camera permissions are allowed.</li>
                  <li>For <strong>In-clinic visits</strong>, arrive 10 minutes before your slot time with ID proof.</li>
                  <li>Have previous medical reports and prescription history handy for the physician.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
