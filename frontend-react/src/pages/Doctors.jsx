import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DoctorAPI, FALLBACK_DOCTORS, showToast } from "../services/api";
import DoctorCard from "../components/DoctorCard";
import Loading, { ErrorState, EmptyState } from "../components/Loading";

const specIcons = { Cardiology:"❤️", Neurology:"🧠", Dermatology:"✨", "General Medicine":"🩺", Orthopedics:"🦴", Pediatrics:"👶", default:"🩺" };

export default function Doctors() {
  const [searchParams] = useSearchParams();
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState(searchParams.get("mode") || "");
  const [spec, setSpec] = useState(searchParams.get("specialty") || "");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const docs = await DoctorAPI.getAll();
        setAllDoctors(docs || []);
      } catch (e) {
        setAllDoctors(FALLBACK_DOCTORS);
        showToast("Using demo doctors (backend unavailable)", "warning");
      } finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    if (searchParams.get("mode")) setMode(searchParams.get("mode"));
    if (searchParams.get("specialty")) setSpec(searchParams.get("specialty"));
  }, [searchParams]);

  const specialties = useMemo(() => [...new Set(allDoctors.map(d => d.specialty))].sort(), [allDoctors]);

  const filtered = useMemo(() => {
    let f = allDoctors.filter(d => {
      const matchQ = !q || d.name.toLowerCase().includes(q.toLowerCase()) || (d.specialty||"").toLowerCase().includes(q.toLowerCase());
      const matchMode = !mode || d.mode === mode;
      const matchSpec = !spec || d.specialty === spec;
      return matchQ && matchMode && matchSpec;
    });
    if (sort === "fee-asc") f.sort((a,b)=>(a.consultationFee||0)-(b.consultationFee||0));
    else if (sort === "fee-desc") f.sort((a,b)=>(b.consultationFee||0)-(a.consultationFee||0));
    else f.sort((a,b)=>a.name.localeCompare(b.name));
    return f;
  }, [allDoctors, q, mode, spec, sort]);

  const online = allDoctors.filter(d=>d.mode==="ONLINE").length;
  const offline = allDoctors.filter(d=>d.mode==="OFFLINE").length;

  const clearAll = () => { setQ(""); setMode(""); setSpec(""); };

  return (
    <>
      <style>{`
        .doc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(310px,1fr)); gap:1.25rem; }
        .doctor-card { background:var(--bg-card); border:1.5px solid var(--border); border-radius:12px; overflow:hidden; transition:var(--transition); display:flex; flex-direction:column; }
        .doctor-card:hover { border-color:var(--primary); box-shadow:var(--shadow-lg); transform:translateY(-3px); }
        .doc-card-top { padding:1.5rem 1.5rem 1.1rem; background:linear-gradient(135deg,var(--primary-subtle),#fff); border-bottom:1px solid var(--border); display:flex; gap:1rem; align-items:flex-start; }
        .doc-avatar-lg { width:64px; height:64px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:800; flex-shrink:0; color:#fff; background:linear-gradient(135deg,var(--primary),var(--primary-hover)); box-shadow:0 4px 10px rgba(2,132,199,.3); }
        .doc-name { font-size:1.05rem; font-weight:800; color:var(--text-heading); margin-bottom:.2rem; }
        .doc-spec { font-size:.82rem; font-weight:600; color:var(--primary); margin-bottom:.4rem; }
        .doc-card-body { padding:1.1rem 1.5rem; flex:1; display:flex; flex-direction:column; gap:.55rem; }
        .doc-info-row { display:flex; align-items:flex-start; gap:.55rem; font-size:.83rem; color:var(--text-muted); }
        .doc-info-row .ic { flex-shrink:0; width:18px; text-align:center; }
        .doc-fee-row { display:flex; align-items:center; justify-content:space-between; padding:.75rem 1.5rem; border-top:1px solid var(--border); background:var(--bg-subtle); }
        .doc-fee { font-size:1.1rem; font-weight:800; color:var(--text-heading); }
        .filter-tag { display:inline-flex; align-items:center; gap:.25rem; padding:.3rem .75rem; border-radius:50px; font-size:.8rem; font-weight:700; cursor:pointer; border:1.5px solid var(--border); background:#fff; color:var(--text-muted); transition:var(--transition); }
        .filter-tag.active { border-color:var(--primary); background:var(--primary-light); color:var(--primary); }
      `}</style>

      <section className="page-hero">
        <div className="page-wrapper">
          <div>
            <div className="hero-breadcrumb"><a href="/">Home</a><span> › </span>Doctors</div>
            <h1 className="hero-page-title">🧑‍⚕️ Our Specialist Doctors</h1>
            <div className="hero-page-desc">Verified specialists for both online and in-clinic consultations.</div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", color: "#fff" }}><div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{allDoctors.length || "—"}</div><div style={{ fontSize: ".78rem", opacity: .8 }}>Total Doctors</div></div>
            <div style={{ textAlign: "center", color: "#fff" }}><div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{online || "—"}</div><div style={{ fontSize: ".78rem", opacity: .8 }}>Online</div></div>
            <div style={{ textAlign: "center", color: "#fff" }}><div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{offline || "—"}</div><div style={{ fontSize: ".78rem", opacity: .8 }}>Offline</div></div>
          </div>
        </div>
      </section>

      <div className="page-wrapper" style={{ marginTop: "1.5rem" }}>
        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search by name or specialty..." value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <select className="form-select" value={mode} onChange={e=>setMode(e.target.value)} style={{ minWidth: "160px", padding: ".42rem .75rem", border: "1.5px solid var(--border)", borderRadius: "8px" }}>
            <option value="">All Modes</option>
            <option value="ONLINE">💻 Online Only</option>
            <option value="OFFLINE">🏥 Offline / Clinic</option>
          </select>
          <select className="form-select" value={spec} onChange={e=>setSpec(e.target.value)} style={{ minWidth: "200px", padding: ".42rem .75rem", border: "1.5px solid var(--border)", borderRadius: "8px" }}>
            <option value="">All Specialties</option>
            {specialties.map(s => <option key={s} value={s}>{specIcons[s] || "🩺"} {s}</option>)}
          </select>
          <select className="form-select" value={sort} onChange={e=>setSort(e.target.value)} style={{ minWidth: "160px", padding: ".42rem .75rem", border: "1.5px solid var(--border)", borderRadius: "8px" }}>
            <option value="name">Sort: Name A-Z</option>
            <option value="fee-asc">Fee: Low to High</option>
            <option value="fee-desc">Fee: High to Low</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: ".65rem" }}>
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            {q && <span className="filter-tag active">"{q}" <span onClick={()=>setQ("")} style={{ cursor:"pointer", marginLeft:".2rem"}}>✕</span></span>}
            {mode && <span className="filter-tag active">{mode==="ONLINE"?"💻 Online":"🏥 Offline"} <span onClick={()=>setMode("")} style={{ cursor:"pointer", marginLeft:".2rem"}}>✕</span></span>}
            {spec && <span className="filter-tag active">{spec} <span onClick={()=>setSpec("")} style={{ cursor:"pointer", marginLeft:".2rem"}}>✕</span></span>}
            {(q||mode||spec) && <span className="filter-tag" onClick={clearAll} style={{ color:"var(--status-cancelled)"}}>Clear all</span>}
          </div>
          <div style={{ fontSize: ".88rem", color: "var(--text-muted)", fontWeight: 600 }}>Showing <strong>{filtered.length}</strong> of <strong>{allDoctors.length}</strong> doctors</div>
        </div>
      </div>

      <div className="page-wrapper" style={{ paddingBottom: "3rem" }}>
        {loading ? <Loading message="Loading doctors..." /> : error ? <ErrorState message={error} /> : !filtered.length ? (
          <EmptyState icon="🔍" title="No doctors found" desc="Try adjusting your filters." />
        ) : (
          <div className="doc-grid">
            {filtered.map((d,i)=><DoctorCard key={d.id} doc={d} idx={i} />)}
          </div>
        )}
      </div>
    </>
  );
}
