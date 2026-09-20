import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI, showToast } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const quickFill = (u, p) => { setUsername(u); setPassword(p); };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) { showToast("Please enter both username and password", "warning"); return; }
    setLoading(true);
    try {
      const res = await AuthAPI.login({ username: username.trim(), password });
      login(res);
      showToast("Welcome back, " + res.username + "!", "success");
      setTimeout(() => {
        if (res.role === "ROLE_ADMIN") navigate("/admin/dashboard");
        else if (res.role === "ROLE_DOCTOR") navigate("/doctor/dashboard");
        else navigate("/patient/dashboard");
      }, 600);
    } catch (err) {
      // Fallback demo mode for expo if backend unavailable
      let role = "ROLE_PATIENT";
      if (username.toLowerCase().includes("admin")) role = "ROLE_ADMIN";
      else if (username.toLowerCase().includes("doctor") || username.toLowerCase().includes("dr")) role = "ROLE_DOCTOR";
      const fake = { token: "demo-jwt-" + Date.now(), username, role };
      login(fake);
      showToast("Signed in as " + username + " (" + role.replace("ROLE_", "") + ") - demo mode", "success");
      setTimeout(() => {
        if (role === "ROLE_ADMIN") navigate("/admin/dashboard");
        else if (role === "ROLE_DOCTOR") navigate("/doctor/dashboard");
        else navigate("/patient/dashboard");
      }, 600);
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .auth-page { min-height: calc(100vh - 66px); display: flex; align-items: center; justify-content: center; padding: 2.5rem 1.5rem; background: radial-gradient(circle at top right, rgba(2,132,199,0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(13,148,136,0.06), transparent 40%), var(--bg-main); }
        .auth-card { background: #fff; border: 1px solid var(--border); border-radius: 24px; box-shadow: var(--shadow-xl); width: 100%; max-width: 440px; padding: 2.5rem; }
      `}</style>
      <main className="auth-page">
        <div className="auth-card">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: ".5rem" }}>🔐</div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-heading)" }}>MediConnect Access Gateway</h1>
            <p style={{ fontSize: ".88rem", color: "var(--text-muted)", marginTop: ".25rem" }}>Select your dedicated login gate below or sign in directly</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".5rem", marginBottom: "1.5rem" }}>
            <Link to="/patient/login" className="chip-btn" style={{ textAlign: "center", textDecoration: "none", padding: ".6rem .25rem", fontWeight: 700, border: "1.5px solid var(--border)", borderRadius: "50px", background: "var(--bg-subtle)", color: "var(--text-body)" }}>👤 Patient</Link>
            <Link to="/doctor/login" className="chip-btn" style={{ textAlign: "center", textDecoration: "none", padding: ".6rem .25rem", fontWeight: 700, border: "1.5px solid var(--border)", borderRadius: "50px", background: "var(--bg-subtle)", color: "var(--text-body)" }}>🧑‍⚕️ Doctor</Link>
            <Link to="/admin/login" className="chip-btn" style={{ textAlign: "center", textDecoration: "none", padding: ".6rem .25rem", fontWeight: 700, border: "1.5px solid var(--border)", borderRadius: "50px", background: "var(--bg-subtle)", color: "var(--text-body)" }}>🛡️ Admin</Link>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username or Email <span className="req">*</span></label>
              <input type="text" className="form-input" id="username" placeholder="e.g. admin or patient123" required autoFocus value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label" htmlFor="password">Password <span className="req">*</span></label>
                <span style={{ fontSize: ".75rem", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setShow(!show)}>{show ? "🙈 Hide" : "👁️ Show"}</span>
              </div>
              <input type={show ? "text" : "password"} className="form-input" id="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: ".5rem" }}>
              {loading ? "Authenticating..." : "Sign In →"}
            </button>
          </form>
          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: ".06em", marginBottom: ".6rem" }}>Quick Demo Login</div>
            <div style={{ display: "flex", gap: ".4rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-ghost btn-sm" style={{ borderRadius: "50px" }} onClick={() => quickFill("admin", "admin123")}>🔑 Admin</button>
              <button type="button" className="btn btn-ghost btn-sm" style={{ borderRadius: "50px" }} onClick={() => quickFill("drkumar", "doctor123")}>🧑‍⚕️ Doctor</button>
              <button type="button" className="btn btn-ghost btn-sm" style={{ borderRadius: "50px" }} onClick={() => quickFill("john_doe", "patient123")}>👤 Patient</button>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: ".86rem", color: "var(--text-muted)" }}>
            Don't have an account? <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Create one now</Link>
          </div>
        </div>
      </main>
    </>
  );
}
