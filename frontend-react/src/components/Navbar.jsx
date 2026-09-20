import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role;
  const normalizedPath = location.pathname.replace(/\/+$/, "") || "/";
  const authRoutes = [
    "/login",
    "/signup",
    "/admin/login",
    "/doctor/login",
    "/patient/login",
  ];
  const isAuthPage = authRoutes.includes(normalizedPath);

  return (
    <header className="site-header">
      <nav className="nav-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">
            <span className="logo-name">MediConnect</span>
            <span className="logo-tag">Doctor Appointment System</span>
          </span>
        </Link>
        {!isAuthPage && (
          <ul className="nav-menu" style={{ display: "flex" }}>
            {role === "ROLE_ADMIN" ? (
              <>
                <li><NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "active" : ""}>🛡️ Admin</NavLink></li>
                <li><NavLink to="/admin/doctors" className={({ isActive }) => isActive ? "active" : ""}>🧑‍⚕️ Doctors</NavLink></li>
                <li><NavLink to="/admin/bookings" className={({ isActive }) => isActive ? "active" : ""}>📋 Bookings</NavLink></li>
              </>
            ) : role === "ROLE_DOCTOR" ? (
              <>
                <li><NavLink to="/doctor/dashboard" className={({ isActive }) => isActive ? "active" : ""}>🧑‍⚕️ Desk</NavLink></li>
                <li><NavLink to="/doctor/schedule" className={({ isActive }) => isActive ? "active" : ""}>🕐 Schedule</NavLink></li>
              </>
            ) : user?.token ? (
              <>
                <li><NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>🏠 Home</NavLink></li>
                <li><NavLink to="/doctors" className={({ isActive }) => isActive ? "active" : ""}>🧑‍⚕️ Doctors</NavLink></li>
                <li><NavLink to="/book" className={({ isActive }) => isActive ? "active" : ""}>📅 Book</NavLink></li>
                <li><NavLink to="/appointments" className={({ isActive }) => isActive ? "active" : ""}>📋 Appointments</NavLink></li>
                <li><NavLink to="/patient/dashboard" className={({ isActive }) => isActive ? "active" : ""}>📊 Dashboard</NavLink></li>
              </>
            ) : (
              <>
                <li><NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>🏠 Home</NavLink></li>
                <li><NavLink to="/doctors" className={({ isActive }) => isActive ? "active" : ""}>🧑‍⚕️ Doctors</NavLink></li>
                <li><NavLink to="/book" className={({ isActive }) => isActive ? "active" : ""}>📅 Book</NavLink></li>
              </>
            )}
          </ul>
        )}
        <div className="nav-cta">
          {user?.token ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="badge badge-confirmed" style={{ textTransform: "none", fontWeight: 700 }}>
                👤 {user.username} ({(role || "").replace("ROLE_", "")})
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          ) : isAuthPage ? (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Link to="/" className="btn btn-ghost btn-sm">🏠 Back to Home</Link>
              {normalizedPath === "/signup" ? (
                <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              ) : (
                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
