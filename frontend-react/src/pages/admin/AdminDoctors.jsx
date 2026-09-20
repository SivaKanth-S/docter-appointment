import { useEffect, useState } from "react";
import { DoctorAPI, FALLBACK_DOCTORS, showToast } from "../../services/api";
import Loading, { ErrorState, EmptyState } from "../../components/Loading";

export default function AdminDoctors() {
  const [doctors,setDoctors]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const [q,setQ]=useState(""); const [modeFilter,setModeFilter]=useState(""); const [specFilter,setSpecFilter]=useState("");
  const [view,setView]=useState("grid"); const [modalOpen,setModalOpen]=useState(false); const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({ name:"", specialty:"Cardiology", mode:"ONLINE", consultationFee:850, availability:"Mon-Fri 10:00-16:00", email:"", phone:"", clinicAddress:"" });

  const load = async ()=>{
    try{ setLoading(true); const d=await DoctorAPI.getAll(); setDoctors(d||[]); setError(null);} catch(e){ setDoctors(FALLBACK_DOCTORS); setError(null); showToast("Using demo data","warning");} finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);

  const filtered = doctors.filter(d=>{
    const qq=q.toLowerCase();
    const matchQ = !q || d.name.toLowerCase().includes(qq) || (d.specialty||"").toLowerCase().includes(qq) || (d.email||"").toLowerCase().includes(qq);
    const matchMode = !modeFilter || d.mode===modeFilter;
    const matchSpec = !specFilter || d.specialty===specFilter;
    return matchQ && matchMode && matchSpec;
  });

  const openAdd = ()=>{ setEditing(null); setForm({ name:"", specialty:"Cardiology", mode:"ONLINE", consultationFee:850, availability:"Mon-Fri 10:00-16:00", email:"", phone:"", clinicAddress:"" }); setModalOpen(true); };
  const openEdit = (doc)=>{ setEditing(doc); setForm({ name:doc.name, specialty:doc.specialty, mode:doc.mode, consultationFee:doc.consultationFee, availability:doc.availability, email:doc.email||"", phone:doc.phone||"", clinicAddress:doc.clinicAddress||"" }); setModalOpen(true); };
  const handleSave = async (e)=>{
    e.preventDefault();
    const payload = { ...form, consultationFee: Number(form.consultationFee) };
    if (!payload.name.trim() || !payload.specialty) { showToast("Name and specialty required","warning"); return; }
    if (payload.mode==="OFFLINE" && !payload.clinicAddress.trim()) { showToast("Clinic address required for OFFLINE doctors","warning"); return; }
    try{
      if (editing) { await DoctorAPI.update(editing.id, payload); showToast("Doctor updated","success"); }
      else { await DoctorAPI.create(payload); showToast("Doctor registered","success"); }
      setModalOpen(false); load();
    } catch(err){ showToast(err.message||"Save failed","error"); }
  };
  const handleDelete = async (id)=>{
    if(!confirm("Delete this doctor?")) return;
    try{ await DoctorAPI.delete(id); showToast("Doctor removed","success"); load(); } catch(e){ showToast(e.message||"Delete failed","error"); }
  };

  return (
    <>
      <style>{`.doctor-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.25rem;}`}</style>
      <section className="page-hero" style={{background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4338ca 100%)"}}>
        <div className="page-wrapper">
          <div>
            <div className="hero-breadcrumb"><a href="/admin/dashboard" style={{color:"rgba(255,255,255,.8)",textDecoration:"none"}}>Admin Portal</a><span> › </span>Manage Doctors</div>
            <div style={{display:"flex",alignItems:"center",gap:".75rem",marginBottom:".35rem"}}><h1 className="hero-page-title" style={{marginBottom:0}}>🧑‍⚕️ Doctor Management</h1><span style={{background:"#4f46e5",color:"#fff",padding:".25rem .65rem",borderRadius:"50px",fontSize:".72rem",fontWeight:800}}>ADMIN</span></div>
            <div className="hero-page-desc">Register new doctors, edit their details, or remove them from the system.</div>
          </div>
          <div style={{display:"flex",gap:".75rem",alignItems:"center"}}>
            <span className="badge badge-confirmed">{doctors.length} Doctors</span>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Register Doctor</button>
            <button className="btn btn-outline btn-sm" style={{color:"#fff",borderColor:"rgba(255,255,255,.4)"}} onClick={load}>🔄 Refresh</button>
          </div>
        </div>
      </section>

      <div className="page-wrapper" style={{marginTop:"2rem",marginBottom:"4rem"}}>
        <div className="filter-bar" style={{marginBottom:"1.5rem"}}>
          <div className="search-wrap"><span className="search-icon">🔍</span><input type="text" placeholder="Search by name, specialty, email..." value={q} onChange={e=>setQ(e.target.value)} /></div>
          <select className="form-select" value={modeFilter} onChange={e=>setModeFilter(e.target.value)} style={{minWidth:"160px",padding:".42rem .75rem",border:"1.5px solid var(--border)",borderRadius:"8px"}}><option value="">All Modes</option><option value="ONLINE">💻 Online Only</option><option value="OFFLINE">🏥 Offline Only</option></select>
          <select className="form-select" value={specFilter} onChange={e=>setSpecFilter(e.target.value)} style={{minWidth:"180px",padding:".42rem .75rem",border:"1.5px solid var(--border)",borderRadius:"8px"}}><option value="">All Specialties</option><option value="Cardiology">Cardiology</option><option value="Neurology">Neurology</option><option value="Dermatology">Dermatology</option><option value="General Medicine">General Medicine</option><option value="Orthopedics">Orthopedics</option><option value="Pediatrics">Pediatrics</option></select>
          <div style={{display:"flex",gap:".5rem",marginLeft:"auto"}}><button className={`btn ${view==="grid"?"btn-outline":"btn-ghost"} btn-sm`} onClick={()=>setView("grid")}>⊞</button><button className={`btn ${view==="table"?"btn-outline":"btn-ghost"} btn-sm`} onClick={()=>setView("table")}>☰</button></div>
        </div>

        {loading ? <Loading message="Loading doctors..." /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length===0 ? <EmptyState title="No doctors found" desc="Try adjusting filters." /> : view==="grid" ? (
          <div className="doctor-grid">
            {filtered.map(d=>(
              <div key={d.id} className="card card-pad">
                <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1rem"}}>
                  <div style={{width:"52px",height:"52px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#fff",background: d.mode==="ONLINE"?"linear-gradient(135deg,#1d4ed8,#3b82f6)":"linear-gradient(135deg,#065f46,#059669)"}}>{d.name.replace("Dr.","").trim().substring(0,2).toUpperCase()}</div>
                  <div><div style={{fontWeight:800,color:"var(--text-heading)"}}>{d.name}</div><div style={{fontSize:".82rem",color:"var(--primary)",fontWeight:600}}>{d.specialty}</div></div>
                  <span className={`badge badge-${d.mode.toLowerCase()}`} style={{marginLeft:"auto"}}>{d.mode}</span>
                </div>
                <div style={{fontSize:".82rem",color:"var(--text-muted)",display:"flex",flexDirection:"column",gap:".3rem"}}>
                  {d.email && <span>✉️ {d.email}</span>}
                  {d.phone && <span>📞 {d.phone}</span>}
                  <span>🕐 {d.availability}</span>
                  {d.clinicAddress && <span>📍 {d.clinicAddress}</span>}
                  <span>💰 ₹{d.consultationFee}</span>
                </div>
                <div style={{display:"flex",gap:".5rem",marginTop:"1.1rem",borderTop:"1px solid var(--border)",paddingTop:"1rem"}}>
                  <button className="btn btn-outline btn-sm" onClick={()=>openEdit(d)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(d.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Specialty</th><th>Mode</th><th>Fee</th><th>Availability</th><th>Contact</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
              <tbody>
                {filtered.map(d=>(
                  <tr key={d.id}><td>#{d.id}</td><td style={{fontWeight:700}}>{d.name}</td><td>{d.specialty}</td><td><span className={`badge badge-${d.mode.toLowerCase()}`}>{d.mode}</span></td><td>₹{d.consultationFee}</td><td>{d.availability}</td><td style={{fontSize:".8rem"}}>{d.email}<br/>{d.phone}</td><td style={{textAlign:"right"}}><button className="btn btn-outline btn-sm" onClick={()=>openEdit(d)}>Edit</button> <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(d.id)}>Delete</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalOpen && (
          <div className="modal-overlay open" onClick={()=>setModalOpen(false)}>
            <div className="modal-box" style={{maxWidth:"580px"}} onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><h3>{editing?"✏️ Edit Doctor":"🧑‍⚕️ Register New Doctor"}</h3><button className="modal-close" onClick={()=>setModalOpen(false)}>✕</button></div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Dr. Jane Doe" /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Specialty <span className="req">*</span></label><select className="form-select" value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})} required><option>Cardiology</option><option>Neurology</option><option>Dermatology</option><option>General Medicine</option><option>Orthopedics</option><option>Pediatrics</option></select></div>
                    <div className="form-group"><label className="form-label">Consultation Mode <span className="req">*</span></label><select className="form-select" value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})} required><option value="ONLINE">💻 Online Video</option><option value="OFFLINE">🏥 In-Clinic</option></select></div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Consultation Fee (₹) <span className="req">*</span></label><input type="number" className="form-input" value={form.consultationFee} onChange={e=>setForm({...form,consultationFee:e.target.value})} required min={100} /></div>
                    <div className="form-group"><label className="form-label">Availability Hours</label><input className="form-input" value={form.availability} onChange={e=>setForm({...form,availability:e.target.value})} placeholder="Mon-Fri 10:00-16:00" /></div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="doctor@mediconnect.org" /></div>
                    <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 98000 00000" /></div>
                  </div>
                  {form.mode==="OFFLINE" && <div className="form-group"><label className="form-label">Clinic Address <span className="req">*</span></label><input className="form-input" value={form.clinicAddress} onChange={e=>setForm({...form,clinicAddress:e.target.value})} placeholder="Suite 204, City Health Complex, Chennai" required /></div>}
                </div>
                <div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={()=>setModalOpen(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing?"Update Doctor":"Register Doctor"}</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
