let BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
// Normalize: if VITE_API_BASE_URL already ends with /api, strip it to avoid double /api
if (BASE_URL.endsWith("/api")) BASE_URL = BASE_URL.slice(0, -4);
BASE_URL = BASE_URL.replace(/\/$/, "");
const BASE_API = `${BASE_URL}/api`;

const API = {
  doctors: `${BASE_API}/doctors`,
  appointments: `${BASE_API}/appointments`,
  specialties: `${BASE_API}/specialties`,
  reports: `${BASE_API}/reports`,
  auth: `${BASE_API}/auth`,
  admin: `${BASE_API}/admin`,
  slots: `${BASE_API}/slots`,
};

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("jwt_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw { status: res.status, message: err.message || `HTTP ${res.status} error` };
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const DoctorAPI = {
  getAll: (params = "") => apiFetch(`${API.doctors}${params}`),
  getById: (id) => apiFetch(`${API.doctors}/${id}`),
  getByMode: (mode) => apiFetch(`${API.doctors}/mode/${mode}`),
  getBySpecialty: (specialty) => apiFetch(`${API.doctors}/specialty/${encodeURIComponent(specialty)}`),
  create: (data) => apiFetch(API.doctors, { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`${API.doctors}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`${API.doctors}/${id}`, { method: "DELETE" }),
};

export const AppointmentAPI = {
  getAll: (params = "") => apiFetch(`${API.appointments}${params}`),
  getById: (id) => apiFetch(`${API.appointments}/${id}`),
  getByStatus: (status) => apiFetch(`${API.appointments}?status=${status}`),
  getByDoctor: (doctorId) => apiFetch(`${API.appointments}?doctorId=${doctorId}`),
  create: (data) => apiFetch(API.appointments, { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`${API.appointments}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStatus: (id, status) => apiFetch(`${API.appointments}/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  confirm: (id) => apiFetch(`${API.appointments}/${id}/confirm`, { method: "POST" }),
  complete: (id) => apiFetch(`${API.appointments}/${id}/complete`, { method: "POST" }),
  cancel: (id) => apiFetch(`${API.appointments}/${id}/cancel`, { method: "POST" }),
  noShow: (id) => apiFetch(`${API.appointments}/${id}/no-show`, { method: "POST" }),
  delete: (id) => apiFetch(`${API.appointments}/${id}`, { method: "DELETE" }),
};

export const SpecialtyAPI = {
  getAll: () => apiFetch(API.specialties),
};

export const ReportAPI = {
  daily: (date = "") => apiFetch(`${API.reports}/daily${date ? `?date=${date}` : ""}`),
  revenue: () => apiFetch(`${API.reports}/revenue`),
  byMode: () => apiFetch(`${API.reports}/appointments-by-mode`),
  bySpecialty: () => apiFetch(`${API.reports}/appointments-by-specialty`),
  adminDashboard: () => apiFetch(`${API.admin}/dashboard`),
};

export const AuthAPI = {
  login: (data) => apiFetch(`${API.auth}/login`, { method: "POST", body: JSON.stringify(data) }),
  register: (data) => apiFetch(`${API.auth}/register`, { method: "POST", body: JSON.stringify(data) }),
};

export const SlotAPI = {
  getForDoctor: (doctorId, date = "") => apiFetch(`${BASE_API}/doctors/${doctorId}/slots${date ? `?date=${date}` : ""}`),
  create: (data) => apiFetch(API.slots, { method: "POST", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`${API.slots}/${id}`, { method: "DELETE" }),
};

export function getAuthUser() {
  return {
    token: localStorage.getItem("jwt_token"),
    username: localStorage.getItem("current_user"),
    role: localStorage.getItem("user_role"),
  };
}

export function setSession(authData) {
  if (authData.token) localStorage.setItem("jwt_token", authData.token);
  if (authData.username) localStorage.setItem("current_user", authData.username);
  if (authData.role) localStorage.setItem("user_role", authData.role);
}

export function clearSession() {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("current_user");
  localStorage.removeItem("user_role");
}

export function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function formatTimeAMPM(time) {
  if (!time) return "";
  if (time.includes("AM") || time.includes("PM")) return time;
  const parts = time.split(":");
  if (parts.length < 2) return time;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  if (isNaN(hour) || isNaN(parseInt(minute, 10))) return time;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
}

export const FALLBACK_DOCTORS = [
  { id: 1, name: "Dr. Sarah Jenkins", specialty: "Cardiology", mode: "ONLINE", email: "sarah.jenkins@mediconnect.org", phone: "+91 98401 11223", consultationFee: 850, availability: "Mon-Fri 10:00-16:00" },
  { id: 2, name: "Dr. Vikram Malhotra", specialty: "Neurology", mode: "ONLINE", email: "vikram.malhotra@mediconnect.org", phone: "+91 98402 22334", consultationFee: 1100, availability: "Tue-Sat 14:00-19:00" },
  { id: 3, name: "Dr. Priya Sharma", specialty: "Dermatology", mode: "ONLINE", email: "priya.sharma@mediconnect.org", phone: "+91 98403 33445", consultationFee: 650, availability: "Mon-Wed 09:00-13:00" },
  { id: 4, name: "Dr. Rajesh Kumar", specialty: "General Medicine", mode: "ONLINE", email: "rajesh.kumar@mediconnect.org", phone: "+91 98404 44556", consultationFee: 500, availability: "Mon-Sat 16:00-20:00" },
  { id: 5, name: "Dr. Arun Kumar", specialty: "Cardiology", mode: "OFFLINE", email: "arun.kumar@metrohospital.org", phone: "+91 94441 55667", consultationFee: 900, clinicAddress: "Cabin 204, Apollo Heart Center, Greams Road, Chennai", availability: "Mon-Sat 09:00-14:00" },
  { id: 6, name: "Dr. Meera Nambiar", specialty: "Neurology", mode: "OFFLINE", email: "meera.nambiar@metrohospital.org", phone: "+91 94442 66778", consultationFee: 1250, clinicAddress: "Neuro OPD Block 3, City Specialty Hospital, Chennai", availability: "Mon-Fri 10:00-15:00" },
  { id: 7, name: "Dr. Ananya Roy", specialty: "Dermatology", mode: "OFFLINE", email: "ananya.roy@metrohospital.org", phone: "+91 94443 77889", consultationFee: 750, clinicAddress: "Skin & Laser Clinic, Suite 102, Fortis Malar, Chennai", availability: "Tue-Sat 11:00-17:00" },
  { id: 8, name: "Dr. David Wilson", specialty: "Orthopedics", mode: "OFFLINE", email: "david.wilson@metrohospital.org", phone: "+91 94444 88990", consultationFee: 800, clinicAddress: "Orthopedic Wing B, Global Health City, Chennai", availability: "Mon-Fri 08:30-13:30" },
  { id: 9, name: "Dr. Sunita Patel", specialty: "Pediatrics", mode: "OFFLINE", email: "sunita.patel@metrohospital.org", phone: "+91 94445 99001", consultationFee: 600, clinicAddress: "Child Care Center, Rainbow Children's Hospital, Chennai", availability: "Mon-Sat 09:30-16:30" },
];

export function findDoctorForUser(doctors, user) {
  if (!doctors || doctors.length === 0) return null;
  if (!user || !user.username) return doctors[0];

  const u = user.username.toLowerCase().trim();
  const uClean = u.replace(/^dr[\._\s]*/i, "").replace(/[^a-z0-9]/g, "");

  // 1. Direct username in email
  let found = doctors.find(d => d.email && d.email.toLowerCase().includes(u));
  if (found) return found;

  // 2. Clean username in email
  if (uClean.length > 2) {
    found = doctors.find(d => d.email && d.email.toLowerCase().replace(/[^a-z0-9]/g, "").includes(uClean));
    if (found) return found;
  }

  // 3. Known mapping: drkumar -> Dr. Rajesh Kumar (or any doctor with kumar)
  if (u === "drkumar" || uClean === "kumar") {
    found = doctors.find(d => d.name?.toLowerCase().includes("rajesh kumar") || d.name?.toLowerCase().includes("kumar"));
    if (found) return found;
  }

  // 4. Name match
  found = doctors.find(d => {
    const docClean = d.name.toLowerCase().replace(/^dr[\._\s]*/i, "").replace(/[^a-z0-9]/g, "");
    return docClean.includes(uClean) || (uClean.length > 2 && uClean.includes(docClean));
  });
  if (found) return found;

  // 5. Fallback
  return doctors[0];
}

export default { DoctorAPI, AppointmentAPI, SpecialtyAPI, ReportAPI, AuthAPI, SlotAPI, findDoctorForUser };
