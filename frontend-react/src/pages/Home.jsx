import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DoctorAPI, ReportAPI, FALLBACK_DOCTORS } from "../services/api";
import Loading, { ErrorState } from "../components/Loading";

const specIcons = { Cardiology:"❤️", Neurology:"🧠", Dermatology:"✨", "General Medicine":"🩺", Orthopedics:"🦴", Pediatrics:"👶", default:"🩺" };

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [docs, rep] = await Promise.all([
          DoctorAPI.getAll().catch(() => FALLBACK_DOCTORS),
          ReportAPI.daily().catch(() => null),
        ]);
        setDoctors(docs || []);
        setSummary(rep);
      } catch (e) {
        setError(e.message || "Failed to load");
        setDoctors(FALLBACK_DOCTORS);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const specMap = {};
  doctors.forEach(d => { specMap[d.specialty] = (specMap[d.specialty] || 0) + 1; });
  const totalAppts = summary?.totalAppointments ?? summary?.total ?? "—";
  const totalDoctors = doctors.length || 9;
  const totalSpec = Object.keys(specMap).length || 6;

  return (
    <>
      <style>{`
        .hero-section { min-height: calc(100vh - 66px); background: linear-gradient(150deg, #0c4a6e 0%, #0284c7 45%, #06b6d4 100%); display: flex; align-items: center; position: relative; overflow: hidden; padding: 4rem 0; }
        .hero-section::before { content:''; position:absolute; inset:0; background: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
        .hero-inner { max-width:1320px; margin:0 auto; padding:0 1.5rem; display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center; position:relative; z-index:1; }
        .hero-eyebrow { display:inline-flex; align-items:center; gap:.5rem; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.25); color:#e0f2fe; padding:.35rem .9rem; border-radius:50px; font-size:.8rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; margin-bottom:1.25rem; }
        .hero-title { font-size:3.25rem; font-weight:800; line-height:1.1; color:#fff; letter-spacing:-.03em; margin-bottom:1.25rem; }
        .hero-title em { font-style:normal; color:#7dd3fc; }
        .hero-desc { font-size:1.08rem; color:rgba(255,255,255,.85); line-height:1.7; margin-bottom:2rem; max-width:480px; }
        .hero-actions { display:flex; gap:.9rem; flex-wrap:wrap; margin-bottom:2.5rem; }
        .hero-stats { display:flex; gap:2.5rem; flex-wrap:wrap; }
        .hero-stat-item { color:#fff; }
        .hero-stat-num { font-size:1.85rem; font-weight:800; display:block; letter-spacing:-.02em; }
        .hero-stat-lbl { font-size:.78rem; opacity:.8; text-transform:uppercase; letter-spacing:.07em; }
        .hero-visual { display:flex; flex-direction:column; gap:1rem; }
        .appt-card-demo { background:rgba(255,255,255,.97); border-radius:16px; padding:1.35rem 1.5rem; box-shadow:0 20px 60px rgba(0,0,0,.25); display:flex; align-items:center; gap:1.1rem; color:var(--text-heading); animation:floatCard 3s ease-in-out infinite; }
        @keyframes floatCard { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
        .appt-card-demo:nth-child(2) { animation-delay:.8s; margin-left:2rem; }
        .appt-card-demo:nth-child(3) { animation-delay:1.5s; margin-left:1rem; }
        .doc-avatar { width:54px; height:54px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.4rem; font-weight:800; flex-shrink:0; }
        .doc-avatar.blue { background:#dbeafe; color:#1d4ed8; }
        .doc-avatar.green { background:#dcfce7; color:#15803d; }
        .doc-avatar.purple { background:#ede9fe; color:#7c3aed; }
        .specialties-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:1rem; }
        .specialty-card { background:var(--bg-card); border:1.5px solid var(--border); border-radius:12px; padding:1.5rem 1.1rem; text-align:center; cursor:pointer; text-decoration:none; transition:var(--transition); display:block; }
        .specialty-card:hover { border-color:var(--primary); box-shadow:0 4px 18px rgba(2,132,199,.15); transform:translateY(-3px); }
        .spec-icon { font-size:2.2rem; margin-bottom:.65rem; line-height:1; }
        .spec-name { font-size:.88rem; font-weight:700; color:var(--text-heading); }
        .spec-count { font-size:.75rem; color:var(--text-muted); margin-top:.2rem; }
        .how-section { background:linear-gradient(180deg,var(--bg-subtle) 0%,var(--bg-main) 100%); }
        .steps-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; position:relative; }
        .steps-grid::before { content:''; position:absolute; top:52px; left:12%; right:12%; height:2px; background:linear-gradient(90deg,var(--primary) 0%,var(--secondary) 100%); z-index:0; }
        .step-card { text-align:center; position:relative; z-index:1; }
        .step-num { width:52px; height:52px; background:linear-gradient(135deg,var(--primary),var(--primary-hover)); color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:800; margin:0 auto 1rem; box-shadow:0 4px 12px rgba(2,132,199,.3); border:3px solid #fff; }
        .mode-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.75rem; }
        .mode-card-feature { border-radius:24px; padding:2.5rem; position:relative; overflow:hidden; }
        .mode-online-card { background:linear-gradient(135deg,#eff6ff,#dbeafe); border:1.5px solid #93c5fd; }
        .mode-offline-card { background:linear-gradient(135deg,#ecfdf5,#dcfce7); border:1.5px solid #6ee7b7; }
        .mode-features { list-style:none; display:flex; flex-direction:column; gap:.55rem; margin:1.25rem 0; }
        .mode-features li { display:flex; align-items:center; gap:.6rem; font-size:.9rem; font-weight:600; color:var(--text-body); }
        .trust-row { display:flex; align-items:center; justify-content:center; gap:2.5rem; flex-wrap:wrap; padding:1.75rem 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
        .trust-item { display:flex; align-items:center; gap:.55rem; color:var(--text-muted); font-size:.88rem; font-weight:600; }
        @media(max-width:1024px){ .hero-inner{grid-template-columns:1fr;} .hero-visual{display:none;} }
        @media(max-width:768px){ .hero-title{font-size:2.2rem;} .steps-grid{grid-template-columns:repeat(2,1fr);} .steps-grid::before{display:none;} .mode-grid{grid-template-columns:1fr;} .specialties-grid{grid-template-columns:repeat(3,1fr);} }
        @media(max-width:480px){ .specialties-grid{grid-template-columns:repeat(2,1fr);} }
      `}</style>

      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-eyebrow">✦ Trusted Healthcare Platform</span>
            <h1 className="hero-title">Your Health,<br /><em>Our Priority</em></h1>
            <p className="hero-desc">Book appointments with expert doctors instantly — online from home or in-clinic. Fast, secure, and completely paperless.</p>
            <div className="hero-actions">
              <Link to="/book" className="btn btn-xl" style={{ background: "#fff", color: "var(--primary)", fontWeight: 800, boxShadow: "0 4px 16px rgba(0,0,0,.2)" }}>📅 Book Now</Link>
              <Link to="/doctors" className="btn btn-xl btn-outline" style={{ borderColor: "rgba(255,255,255,.5)", color: "#fff" }}>🧑‍⚕️ Find Doctors</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat-item"><span className="hero-stat-num">{totalDoctors}</span><span className="hero-stat-lbl">Doctors</span></div>
              <div className="hero-stat-item"><span className="hero-stat-num">{totalAppts !== "—" ? totalAppts + "+" : "—"}</span><span className="hero-stat-lbl">Appointments</span></div>
              <div className="hero-stat-item"><span className="hero-stat-num">{totalSpec}</span><span className="hero-stat-lbl">Specialties</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="appt-card-demo">
              <div className="doc-avatar blue">SJ</div>
              <div><div style={{ fontSize: ".95rem", fontWeight: 700 }}>Dr. Sarah Jenkins</div><div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>Cardiology • Online</div></div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}><div style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--primary)" }}>10:00 AM</div><div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>₹850</div></div>
              <span className="badge badge-confirmed">Confirmed</span>
            </div>
            <div className="appt-card-demo">
              <div className="doc-avatar green">AK</div>
              <div><div style={{ fontSize: ".95rem", fontWeight: 700 }}>Dr. Arun Kumar</div><div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>Cardiology • Offline</div></div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}><div style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--primary)" }}>09:30 AM</div><div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>₹900</div></div>
              <span className="badge badge-completed">Completed</span>
            </div>
            <div className="appt-card-demo">
              <div className="doc-avatar purple">VM</div>
              <div><div style={{ fontSize: ".95rem", fontWeight: 700 }}>Dr. Vikram Malhotra</div><div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>Neurology • Online</div></div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}><div style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--primary)" }}>02:00 PM</div><div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>₹1100</div></div>
              <span className="badge badge-pending">Pending</span>
            </div>
          </div>
        </div>
      </section>

      <div className="page-wrapper">
        <div className="trust-row">
          <div className="trust-item"><span>🔒</span> Secure & Private</div>
          <div className="trust-item"><span>💰</span> Transparent Fees</div>
          <div className="trust-item"><span>💻</span> Online & In-Clinic</div>
          <div className="trust-item"><span>⚡</span> Instant Confirmation</div>
          <div className="trust-item"><span>✔️</span> Verified Doctors</div>
          <div className="trust-item"><span>🕐</span> 24/7 Booking</div>
        </div>
      </div>

      <section className="page-section">
        <div className="page-wrapper">
          <div className="section-head">
            <div className="section-title">Browse by Specialty</div>
            <div className="section-desc">Find the right specialist for your health needs.</div>
          </div>
          {loading ? <Loading message="Loading specialties..." /> : error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : (
            <div className="specialties-grid">
              {Object.entries(specMap).map(([name, count]) => (
                <Link key={name} to={`/doctors?specialty=${encodeURIComponent(name)}`} className="specialty-card">
                  <div className="spec-icon">{specIcons[name] || specIcons.default}</div>
                  <div className="spec-name">{name}</div>
                  <div className="spec-count">{count} doctor{count !== 1 ? "s" : ""}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="page-section how-section">
        <div className="page-wrapper">
          <div className="section-head" style={{ textAlign: "center" }}>
            <div className="section-title">How It Works</div>
            <div className="section-desc" style={{ margin: "0 auto" }}>Book your appointment in 4 simple steps.</div>
          </div>
          <div className="steps-grid">
            <div className="step-card"><div className="step-num">1</div><div style={{ fontSize: "1.4rem", marginBottom: ".6rem" }}>🔍</div><div style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: ".35rem" }}>Choose a Specialty</div><div style={{ fontSize: ".82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>Browse our range of medical specialties and find the right care for you.</div></div>
            <div className="step-card"><div className="step-num">2</div><div style={{ fontSize: "1.4rem", marginBottom: ".6rem" }}>🧑‍⚕️</div><div style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: ".35rem" }}>Select a Doctor</div><div style={{ fontSize: ".82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>View doctor profiles, ratings, consultation fees, and available slots.</div></div>
            <div className="step-card"><div className="step-num">3</div><div style={{ fontSize: "1.4rem", marginBottom: ".6rem" }}>📅</div><div style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: ".35rem" }}>Pick a Slot</div><div style={{ fontSize: ".82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>Choose a date & time that works for you — online or in-clinic mode.</div></div>
            <div className="step-card"><div className="step-num">4</div><div style={{ fontSize: "1.4rem", marginBottom: ".6rem" }}>✅</div><div style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: ".35rem" }}>Get Confirmed</div><div style={{ fontSize: ".82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>Receive instant booking confirmation with your telehealth link or clinic address.</div></div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-wrapper">
          <div className="section-head"><div className="section-title">Two Ways to See Your Doctor</div><div className="section-desc">Choose the mode that works best for you — both powered by dedicated specialists.</div></div>
          <div className="mode-grid">
            <div className="mode-card-feature mode-online-card">
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💻</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: ".65rem" }}>Online Consultation</div>
              <p style={{ fontSize: ".9rem", color: "var(--text-muted)" }}>Consult top doctors from the comfort of your home via secure video call.</p>
              <ul className="mode-features">
                <li><span style={{ color: "#22c55e" }}>✓</span> Auto-generated secure meeting room link</li>
                <li><span style={{ color: "#22c55e" }}>✓</span> No travel — zero waiting time</li>
                <li><span style={{ color: "#22c55e" }}>✓</span> Dedicated online-only specialist panel</li>
                <li><span style={{ color: "#22c55e" }}>✓</span> Digital prescriptions & reports</li>
              </ul>
              <Link to="/doctors?mode=ONLINE" className="btn btn-primary">Find Online Doctors →</Link>
            </div>
            <div className="mode-card-feature mode-offline-card">
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏥</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: ".65rem" }}>In-Clinic Visit</div>
              <p style={{ fontSize: ".9rem", color: "var(--text-muted)" }}>Visit the doctor at a nearby clinic for a physical examination and consultation.</p>
              <ul className="mode-features">
                <li><span style={{ color: "#22c55e" }}>✓</span> Physical examination & diagnostics</li>
                <li><span style={{ color: "#22c55e" }}>✓</span> Clinic address auto-provided on booking</li>
                <li><span style={{ color: "#22c55e" }}>✓</span> Dedicated offline-only specialist panel</li>
                <li><span style={{ color: "#22c55e" }}>✓</span> Paper & digital prescriptions</li>
              </ul>
              <Link to="/doctors?mode=OFFLINE" className="btn btn-success">Find Clinic Doctors →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
