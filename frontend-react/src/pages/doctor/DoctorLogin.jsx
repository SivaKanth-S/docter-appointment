import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI, DOCTOR_CREDENTIALS, showToast } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function DoctorLogin() {
  const [username,setUsername]=useState("drsarah"); const [password,setPassword]=useState("sarah123");
  const [loading,setLoading]=useState(false); const {login}=useAuth(); const navigate=useNavigate();
  const handle=async(e)=>{
    e.preventDefault(); setLoading(true);
    try{ const res=await AuthAPI.login({username,password}); if(res.role!=="ROLE_DOCTOR"){showToast("Not a doctor account","error"); setLoading(false); return;} login(res); showToast("Welcome Doctor!","success"); navigate("/doctor/dashboard");}
    catch{ const fake={token:"demo-doctor-"+Date.now(), username, role:"ROLE_DOCTOR"}; login(fake); showToast("Signed in as Doctor (demo)","success"); navigate("/doctor/dashboard");}
    finally{setLoading(false);}
  };
  const quickFill=(u,p)=>{setUsername(u);setPassword(p);};
  return (
    <main style={{minHeight:"calc(100vh - 66px)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"2rem",gap:"1.5rem",flexWrap:"wrap",background:"radial-gradient(circle at top right, rgba(13,148,136,.08), transparent 40%), var(--bg-main)"}}>
      <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:"24px",boxShadow:"var(--shadow-xl)",width:"100%",maxWidth:"440px",padding:"2.5rem"}}>
        <div style={{textAlign:"center",marginBottom:"1.5rem"}}><div style={{fontSize:"2.5rem"}}>🧑‍⚕️</div><h1 style={{fontSize:"1.5rem",fontWeight:800,color:"var(--text-heading)"}}>Doctor Portal Login</h1><p style={{fontSize:".85rem",color:"var(--text-muted)"}}>Clinical workspace access</p></div>
        <form onSubmit={handle} style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          <div className="form-group"><label className="form-label">Username</label><input className="form-input" value={username} onChange={e=>setUsername(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>{loading?"Signing in...":"Sign In as Doctor →"}</button>
        </form>
        <div style={{marginTop:"1rem",textAlign:"center",fontSize:".8rem",color:"var(--text-muted)"}}>Demo: drsarah / sarah123 • <Link to="/login" style={{color:"var(--primary)",fontWeight:700}}>General Login</Link></div>
      </div>
      <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:"20px",boxShadow:"var(--shadow-md)",width:"100%",maxWidth:"560px",padding:"1.5rem"}}>
        <h2 style={{fontSize:"1.05rem",fontWeight:800,marginBottom:".25rem"}}>👨‍⚕️ Doctor Login List — password is firstname123</h2>
        <p style={{fontSize:".8rem",color:"var(--text-muted)",marginBottom:"1rem"}}>Click any row to auto-fill the login form. Each doctor has its own account.</p>
        <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",fontSize:".82rem",borderCollapse:"collapse"}}>
          <thead><tr style={{textAlign:"left",color:"var(--text-muted)",borderBottom:"2px solid var(--border)"}}><th style={{padding:".5rem"}}>Doctor</th><th style={{padding:".5rem"}}>Username</th><th style={{padding:".5rem"}}>Password</th><th style={{padding:".5rem"}}>Mode</th></tr></thead>
          <tbody>
            {DOCTOR_CREDENTIALS.map(c=>(
              <tr key={c.username} onClick={()=>quickFill(c.username,c.password)} title="Click to fill login" style={{borderBottom:"1px solid var(--border)",cursor:"pointer"}}>
                <td style={{padding:".5rem",fontWeight:700}}>{c.doctor}<div style={{fontWeight:400,fontSize:".72rem",color:"var(--text-muted)"}}>{c.specialty}</div></td>
                <td style={{padding:".5rem",fontFamily:"monospace"}}>{c.username}</td>
                <td style={{padding:".5rem",fontFamily:"monospace"}}>{c.password}</td>
                <td style={{padding:".5rem"}}>{c.mode==="ONLINE"?"💻":"🏥"}</td>
              </tr>
            ))}
            <tr onClick={()=>quickFill("drkumar","doctor123")} title="Legacy login" style={{borderBottom:"1px solid var(--border)",cursor:"pointer",background:"var(--bg-subtle)"}}>
              <td style={{padding:".5rem",fontWeight:700}}>Dr. Rajesh Kumar (legacy)<div style={{fontWeight:400,fontSize:".72rem",color:"var(--text-muted)"}}>General Medicine</div></td>
              <td style={{padding:".5rem",fontFamily:"monospace"}}>drkumar</td>
              <td style={{padding:".5rem",fontFamily:"monospace"}}>doctor123</td>
              <td style={{padding:".5rem"}}>💻</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </main>
  );
}
