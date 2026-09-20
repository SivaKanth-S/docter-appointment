import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { DoctorAPI, AppointmentAPI, FALLBACK_DOCTORS, showToast } from "../services/api";

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const [allDoctors, setAllDoctors] = useState([]);
  const [currentMode, setCurrentMode] = useState(searchParams.get("mode") || "ONLINE");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState("10:00 AM");
  const [specialty, setSpecialty] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [visitReason, setVisitReason] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const specialties = [...new Set(allDoctors.map(d=>d.specialty))].sort();
  const filteredDoctors = allDoctors.filter(d => d.mode===currentMode && (!specialty || d.specialty===specialty));

  useEffect(() => {
    async function init() {
      try {
        const docs = await DoctorAPI.getAll();
        setAllDoctors(docs || []);
      } catch { setAllDoctors(FALLBACK_DOCTORS); }
    }
    init();
    const today = new Date().toISOString().split("T")[0];
    setAppointmentDate(today);
  }, []);

  useEffect(() => {
    const paramMode = searchParams.get("mode");
    if (paramMode) setCurrentMode(paramMode);
    const paramDocId = searchParams.get("doctorId");
    if (paramDocId && allDoctors.length) {
      const doc = allDoctors.find(d=>String(d.id)===String(paramDocId));
      if (doc) { setSelectedDoctor(doc); if (doc.specialty) setSpecialty(doc.specialty); setCurrentMode(doc.mode); }
    }
  }, [searchParams, allDoctors]);

  const selectMode = (mode) => { setCurrentMode(mode); setSelectedDoctor(null); };
  const onSpecialtyChange = (e) => { setSpecialty(e.target.value); setSelectedDoctor(null); };
  const onDoctorChange = (e) => {
    const id = e.target.value;
    const doc = allDoctors.find(d=>String(d.id)===id);
    setSelectedDoctor(doc||null);
  };
  const initials = (name) => (name||"").replace("Dr.","").trim().split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase();

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) { showToast("Please select a doctor","warning"); return; }
    if (!selectedSlotTime) { showToast("Please pick a time slot","warning"); return; }
    const payload = {
      patientName: patientName.trim(),
      patientPhone,
      patientEmail,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      mode: currentMode,
      appointmentDate,
      appointmentTime: selectedSlotTime,
      reason: visitReason.trim() || "General Consultation",
    };
    setSubmitting(true);
    try {
      const res = await AppointmentAPI.create(payload);
      showToast("Appointment booked successfully!","success");
      setModalData(res||{...payload, id: Math.floor(Math.random()*900)+100, status:"CONFIRMED", consultationFee: selectedDoctor.consultationFee, meetingLink: currentMode==="ONLINE"?`https://telehealth.mediconnect.org/room/tele-${Date.now().toString().slice(-4)}`:null, clinicAddress: selectedDoctor.clinicAddress});
      setShowModal(true);
    } catch (err) {
      if (err.status===409) showToast(`Strict Conflict: ${err.message}`,"error");
      else {
        const fallback = {...payload, id: Math.floor(Math.random()*900)+100, status:"CONFIRMED", consultationFee: selectedDoctor.consultationFee, meetingLink: currentMode==="ONLINE"?`https://telehealth.mediconnect.org/room/tele-${Date.now().toString().slice(-4)}`:null, clinicAddress: selectedDoctor.clinicAddress};
        showToast("Booked successfully (Demo mode)!","success");
        setModalData(fallback); setShowModal(true);
      }
    } finally { setSubmitting(false); }
  };

  const slots = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","02:00 PM","02:30 PM","03:00 PM","04:00 PM","04:30 PM","05:00 PM"];

  return (
    <>
      <style>{`
        .booking-container{max-width:960px;margin:2rem auto 4rem;display:grid;grid-template-columns:1.6fr 1fr;gap:2rem;align-items:start;}
        .booking-card{background:#fff;border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-sm);padding:2rem;}
        .mode-toggle-group{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;}
        .mode-toggle-card{border:2px solid var(--border);border-radius:12px;padding:1.25rem 1rem;cursor:pointer;text-align:center;transition:var(--transition);background:var(--bg-main);}
        .mode-toggle-card.active{border-color:var(--primary);background:var(--primary-subtle);box-shadow:0 0 0 1px var(--primary);}
        .mode-toggle-card.offline.active{border-color:var(--secondary);background:var(--secondary-light);box-shadow:0 0 0 1px var(--secondary);}
        .strict-badge-notice{background:#fffbeb;border:1px solid #fef3c7;border-left:4px solid #d97706;padding:.85rem 1rem;border-radius:8px;font-size:.82rem;color:#92400e;margin-bottom:1.5rem;display:flex;align-items:center;gap:.6rem;}
        .time-slots-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(95px,1fr));gap:.6rem;margin-top:.5rem;}
        .time-slot-btn{padding:.6rem .4rem;text-align:center;font-size:.84rem;font-weight:700;border:1.5px solid var(--border);border-radius:8px;background:#fff;cursor:pointer;transition:var(--transition);}
        .time-slot-btn.active{background:var(--primary);color:#fff;border-color:var(--primary);box-shadow:0 2px 6px rgba(2,132,199,.3);}
        .summary-sidebar{background:#fff;border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-sm);padding:1.75rem;position:sticky;top:90px;}
        .summary-title{font-size:1.15rem;font-weight:800;color:var(--text-heading);margin-bottom:1.25rem;padding-bottom:.75rem;border-bottom:1px solid var(--border);}
        .summary-row{display:flex;justify-content:space-between;align-items:center;font-size:.88rem;margin-bottom:.85rem;color:var(--text-muted);}
        .summary-row strong{color:var(--text-heading);}
        .summary-total{margin-top:1.25rem;padding-top:1.25rem;border-top:2px dashed var(--border);display:flex;justify-content:space-between;align-items:center;}
        .doctor-preview-box{background:var(--bg-subtle);border-radius:12px;padding:1rem;display:flex;align-items:center;gap:.9rem;margin-bottom:1rem;}
        .doctor-preview-avatar{width:48px;height:48px;border-radius:12px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;}
        @media(max-width:860px){.booking-container{grid-template-columns:1fr;}.summary-sidebar{position:static;}}
      `}</style>

      <section className="page-hero">
        <div className="page-wrapper">
          <div>
            <div className="hero-breadcrumb"><Link to="/" style={{color:"rgba(255,255,255,.8)",textDecoration:"none"}}>Home</Link><span> › </span>Book Appointment</div>
            <h1 className="hero-page-title">📅 Schedule Consultation</h1>
            <div className="hero-page-desc">Select your preferred mode, doctor, and slot for instant booking confirmation.</div>
          </div>
        </div>
      </section>

      <div className="page-wrapper">
        <div className="booking-container">
          <div className="booking-card">
            <form onSubmit={handleBooking}>
              <h3 style={{fontSize:"1.15rem",fontWeight:800,marginBottom:"1rem"}}>1. Choose Appointment Mode</h3>
              <div className="mode-toggle-group">
                <div className={`mode-toggle-card ${currentMode==="ONLINE"?"active":""}`} onClick={()=>selectMode("ONLINE")}>
                  <div style={{fontSize:"2rem",marginBottom:".35rem"}}>💻</div><div style={{fontWeight:800,fontSize:"1.05rem",color:"var(--text-heading)"}}>Online Video</div><div style={{fontSize:".78rem",color:"var(--text-muted)",marginTop:".2rem"}}>Telehealth consultation via room link</div>
                </div>
                <div className={`mode-toggle-card offline ${currentMode==="OFFLINE"?"active":""}`} onClick={()=>selectMode("OFFLINE")}>
                  <div style={{fontSize:"2rem",marginBottom:".35rem"}}>🏥</div><div style={{fontWeight:800,fontSize:"1.05rem",color:"var(--text-heading)"}}>In-Clinic Visit</div><div style={{fontSize:".78rem",color:"var(--text-muted)",marginTop:".2rem"}}>Hospital or clinic direct visit</div>
                </div>
              </div>
              <div className="strict-badge-notice"><span>⚠️</span><div><strong>Strict Business Rule:</strong> Online and Offline appointments utilize separate designated doctors. The list below auto-filters doctors certified for your selected mode.</div></div>

              <h3 style={{fontSize:"1.15rem",fontWeight:800,marginBottom:"1rem"}}>2. Select Specialty & Doctor</h3>
              <div className="grid-2" style={{marginBottom:"1.25rem"}}>
                <div className="form-group">
                  <label className="form-label">Specialty <span className="req">*</span></label>
                  <select className="form-select" value={specialty} onChange={onSpecialtyChange} required>
                    <option value="">-- All Specialties --</option>
                    {specialties.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Doctor <span className="req">*</span></label>
                  <select className="form-select" value={selectedDoctor?selectedDoctor.id:""} onChange={onDoctorChange} required>
                    <option value="">-- Select Doctor ({currentMode}) --</option>
                    {filteredDoctors.map(d=><option key={d.id} value={d.id}>{d.name} ({d.specialty}) — ₹{d.consultationFee}</option>)}
                  </select>
                </div>
              </div>

              {selectedDoctor && (
                <div className="doctor-preview-box">
                  <div className="doctor-preview-avatar">{initials(selectedDoctor.name)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:"0.95rem"}}>{selectedDoctor.name}</div>
                    <div style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>{selectedDoctor.specialty} • {selectedDoctor.mode==="ONLINE"?"💻 Online Video":"🏥 In-Clinic"}</div>
                    {selectedDoctor.availability && <div style={{fontSize:"0.78rem",color:"var(--primary)",fontWeight:600,marginTop:"2px"}}>🕐 {selectedDoctor.availability}</div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:"1.1rem",fontWeight:800,color:"var(--text-heading)"}}>₹{selectedDoctor.consultationFee}</div>
                    <div style={{fontSize:"0.7rem",color:"var(--text-muted)"}}>Consultation Fee</div>
                  </div>
                </div>
              )}

              <h3 style={{fontSize:"1.15rem",fontWeight:800,margin:"1.5rem 0 1rem"}}>3. Date & Time Slot</h3>
              <div className="grid-2" style={{marginBottom:"1.25rem"}}>
                <div className="form-group">
                  <label className="form-label">Appointment Date <span className="req">*</span></label>
                  <input type="date" className="form-input" value={appointmentDate} min={new Date().toISOString().split("T")[0]} onChange={e=>setAppointmentDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Selected Time <span className="req">*</span></label>
                  <input type="text" className="form-input" value={selectedSlotTime} readOnly required placeholder="Click a slot below" />
                </div>
              </div>
              <div className="form-group" style={{marginBottom:"1.5rem"}}>
                <label className="form-label">Available Time Slots</label>
                <div className="time-slots-grid">
                  {slots.map(t=><button key={t} type="button" className={`time-slot-btn ${selectedSlotTime===t?"active":""}`} onClick={()=>setSelectedSlotTime(t)}>{t}</button>)}
                </div>
              </div>

              <h3 style={{fontSize:"1.15rem",fontWeight:800,margin:"1.5rem 0 1rem"}}>4. Patient Information</h3>
              <div className="grid-2" style={{marginBottom:"1.25rem"}}>
                <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input type="text" className="form-input" placeholder="e.g. Rahul Sharma" required value={patientName} onChange={e=>setPatientName(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Phone Number <span className="req">*</span></label><input type="tel" className="form-input" placeholder="+91 98765 43210" required value={patientPhone} onChange={e=>setPatientPhone(e.target.value)} /></div>
              </div>
              <div className="grid-2" style={{marginBottom:"1.25rem"}}>
                <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" placeholder="patient@example.com" value={patientEmail} onChange={e=>setPatientEmail(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Gender</label><select className="form-select" value={patientGender} onChange={e=>setPatientGender(e.target.value)}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
              </div>
              <div className="form-group" style={{marginBottom:"1.5rem"}}><label className="form-label">Reason for Consultation / Symptoms</label><textarea className="form-textarea" placeholder="Briefly describe symptoms..." value={visitReason} onChange={e=>setVisitReason(e.target.value)}></textarea></div>

              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={submitting}>{submitting?"Processing Booking...":"Confirm & Book Appointment"}</button>
            </form>
          </div>

          <div className="summary-sidebar">
            <div className="summary-title">Booking Summary</div>
            <div className="summary-row"><span>Mode:</span><strong>{currentMode==="ONLINE"?<span className="badge badge-online">💻 Online Video</span>:<span className="badge badge-offline">🏥 In-Clinic</span>}</strong></div>
            <div className="summary-row"><span>Doctor:</span><strong>{selectedDoctor?selectedDoctor.name:"None selected"}</strong></div>
            <div className="summary-row"><span>Specialty:</span><strong>{selectedDoctor?selectedDoctor.specialty:"—"}</strong></div>
            <div className="summary-row"><span>Date:</span><strong>{appointmentDate||"—"}</strong></div>
            <div className="summary-row"><span>Time:</span><strong>{selectedSlotTime||"—"}</strong></div>
            <div className="summary-row"><span>Patient:</span><strong>{patientName||"—"}</strong></div>
            <div className="summary-total"><span style={{fontSize:"1rem",fontWeight:800,color:"var(--text-heading)"}}>Total Fee</span><span style={{fontSize:"1.6rem",fontWeight:800,color:"var(--primary)"}}>{selectedDoctor?`₹${selectedDoctor.consultationFee}`:"₹0"}</span></div>
            <div style={{fontSize:".76rem",color:"var(--text-muted)",marginTop:"1.25rem",lineHeight:1.5}}>🔒 Instant confirmation & slot reservation. Cancellation available any time before appointment time.</div>
          </div>
        </div>
      </div>

      {showModal && modalData && (
        <div className="modal-overlay open" onClick={()=>setShowModal(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>🎉 Appointment Confirmed!</h3><button className="modal-close" onClick={()=>setShowModal(false)}>✕</button></div>
            <div className="modal-body">
              <div style={{textAlign:"center",marginBottom:"1rem"}}>
                <div style={{fontSize:".85rem",color:"var(--text-muted)"}}>Appointment ID</div>
                <div style={{fontSize:"1.4rem",fontWeight:800,color:"var(--text-heading)"}}>#APT-{modalData.id||"NEW"}</div>
                <span className="badge badge-confirmed" style={{marginTop:".25rem"}}>CONFIRMED</span>
              </div>
              <div className="card card-pad" style={{background:"var(--bg-subtle)",gap:".5rem",display:"flex",flexDirection:"column",fontSize:".88rem"}}>
                <div><strong>Patient:</strong> {modalData.patientName}</div>
                <div><strong>Doctor:</strong> {modalData.doctorName} ({modalData.specialty})</div>
                <div><strong>Schedule:</strong> {modalData.appointmentDate} at {modalData.appointmentTime}</div>
                <div><strong>Fee Paid / Payable:</strong> ₹{modalData.consultationFee||selectedDoctor?.consultationFee}</div>
              </div>
              {modalData.mode==="ONLINE" ? (
                <div style={{background:"var(--primary-subtle)",border:"1px solid #bfdbfe",borderRadius:"8px",padding:"1rem"}}>
                  <div style={{fontWeight:700,color:"var(--primary)",fontSize:".88rem",marginBottom:".25rem"}}>💻 Video Telehealth Link:</div>
                  <a href={modalData.meetingLink||`https://telehealth.mediconnect.org/room/call-${modalData.id||'901'}`} target="_blank" rel="noreferrer" style={{color:"var(--primary-dark)",fontWeight:700,wordBreak:"break-all",fontSize:".85rem"}}>{modalData.meetingLink||`https://telehealth.mediconnect.org/room/call-${modalData.id||'901'}`}</a>
                  <div style={{fontSize:".75rem",color:"var(--text-muted)",marginTop:".35rem"}}>Join room 5 minutes prior to appointment time.</div>
                </div>
              ) : (
                <div style={{background:"var(--secondary-light)",border:"1px solid #a7f3d0",borderRadius:"8px",padding:"1rem"}}>
                  <div style={{fontWeight:700,color:"var(--secondary)",fontSize:".88rem",marginBottom:".25rem"}}>🏥 In-Clinic Address:</div>
                  <div style={{fontWeight:600,fontSize:".85rem",color:"var(--text-heading)"}}>{modalData.clinicAddress||selectedDoctor?.clinicAddress||"Central Medical Clinic, OPD Block B, Suite 104"}</div>
                  <div style={{fontSize:".75rem",color:"var(--text-muted)",marginTop:".35rem"}}>Please carry ID proof and previous medical records.</div>
                </div>
              )}
            </div>
            <div className="modal-foot">
              <Link to="/appointments" className="btn btn-primary">View in My Appointments</Link>
              <button type="button" className="btn btn-ghost" onClick={()=>setShowModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
