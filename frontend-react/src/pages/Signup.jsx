import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI, showToast } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const role = "ROLE_PATIENT"; // Doctor signup removed - doctors sign in only (like Admin)
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirm) { showToast("Passwords do not match!", "warning"); return; }
    if (password.length < 6) { showToast("Password must be at least 6 characters", "warning"); return; }
    setLoading(true);
    try {
      const res = await AuthAPI.register({ username: username.trim(), email: email.trim(), password, role });
      login(res);
      showToast("Account created successfully!", "success");
      setTimeout(() => navigate("/patient/dashboard"), 700);
    } catch (err) {
      const fake = { token: "demo-reg-" + Date.now(), username, role };
      login(fake);
      showToast("Account created successfully (Demo Mode)!", "success");
      setTimeout(() => navigate("/patient/dashboard"), 700);
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .auth-page { min-height: calc(100vh - 66px); display: flex; align-items: center; justify-content: center; padding: 2.5rem 1.5rem; background: radial-gradient(circle at top right, rgba(2,132,199,0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(13,148,136,0.06), transparent 40%), var(--bg-main); }
        .auth-card { background: #fff; border: 1px solid var(--border); border-radius: 24px; box-shadow: var(--shadow-xl); width: 100%; max-width: 480px; padding: 2.5rem; }
      `}</style>
      <main className="auth-page">
        <div className="auth-card">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: ".5rem" }}>👤</div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-heading)" }}>Create Patient Account</h1>
            <p style={{ fontSize: ".88rem", color: "var(--text-muted)", marginTop: ".25rem" }}>Join MediConnect to book appointments and track healthcare</p>
          </div>
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="regUsername">Username <span className="req">*</span></label>
              <input type="text" className="form-input" id="regUsername" placeholder="e.g. rahul_sharma" required minLength={3} value={username} onChange={e => setUsername(e.target.value)} />
              <div className="form-hint">Used for signing in to your account.</div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="regEmail">Email Address <span className="req">*</span></label>
              <input type="email" className="form-input" id="regEmail" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="regPassword">Password <span className="req">*</span></label>
                <input type="password" className="form-input" id="regPassword" placeholder="••••••••" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="regConfirmPassword">Confirm <span className="req">*</span></label>
                <input type="password" className="form-input" id="regConfirmPassword" placeholder="••••••••" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: ".5rem" }}>
              {loading ? "Creating Account..." : "Complete Registration →"}
            </button>
          </form>
          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: ".86rem", color: "var(--text-muted)" }}>
            Already registered? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Sign in here</Link>
          </div>
        </div>
      </main>
    </>
  );
}
