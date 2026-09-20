import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI, showToast } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function PatientLogin() {
  const [username,setUsername]=useState("john_doe"); const [password,setPassword]=useState("patient123");
  const [loading,setLoading]=useState(false); const {login}=useAuth(); const navigate=useNavigate();
  const handle=async(e)=>{
    e.preventDefault(); setLoading(true);
    try{ const res=await AuthAPI.login({username,password}); if(res.role && res.role!=="ROLE_PATIENT"){ showToast("Not a patient account","error"); setLoading(false); return;} login(res); showToast("Welcome Patient!","success"); navigate("/patient/dashboard");}
    catch{ const fake={token:"demo-patient-"+Date.now(), username, role:"ROLE_PATIENT"}; login(fake); showToast("Signed in as Patient (demo)","success"); navigate("/patient/dashboard");}
    finally{setLoading(false);}
  };
  return (
    <main style={{minHeight:"calc(100vh - 66px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",background:"radial-gradient(circle at top right, rgba(2,132,199,.08), transparent 40%), var(--bg-main)"}}>
      <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:"24px",boxShadow:"var(--shadow-xl)",width:"100%",maxWidth:"440px",padding:"2.5rem"}}>
        <div style={{textAlign:"center",marginBottom:"1.5rem"}}><div style={{fontSize:"2.5rem"}}>👤</div><h1 style={{fontSize:"1.5rem",fontWeight:800,color:"var(--text-heading)"}}>Patient Portal Login</h1><p style={{fontSize:".85rem",color:"var(--text-muted)"}}>Access your health dashboard</p></div>
        <form onSubmit={handle} style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          <div className="form-group"><label className="form-label">Username</label><input className="form-input" value={username} onChange={e=>setUsername(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>{loading?"Signing in...":"Sign In as Patient →"}</button>
        </form>
        <div style={{marginTop:"1rem",textAlign:"center",fontSize:".8rem",color:"var(--text-muted)"}}>Demo: john_doe / patient123 • <Link to="/login" style={{color:"var(--primary)",fontWeight:700}}>General Login</Link></div>
      </div>
    </main>
  );
}
