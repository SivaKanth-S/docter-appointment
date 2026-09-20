import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminBookings from "./pages/admin/AdminBookings";

import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";

import PatientLogin from "./pages/patient/PatientLogin";
import PatientDashboard from "./pages/patient/PatientDashboard";

import "./styles/shared.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin public login */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={["ROLE_ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute roles={["ROLE_ADMIN"]}><AdminDoctors /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute roles={["ROLE_ADMIN"]}><AdminBookings /></ProtectedRoute>} />

            {/* Doctor */}
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/doctor/dashboard" element={<ProtectedRoute roles={["ROLE_DOCTOR"]}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/schedule" element={<ProtectedRoute roles={["ROLE_DOCTOR"]}><DoctorSchedule /></ProtectedRoute>} />

            {/* Patient */}
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/patient/dashboard" element={<ProtectedRoute roles={["ROLE_PATIENT"]}><PatientDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
