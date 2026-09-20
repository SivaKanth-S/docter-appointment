# MediConnect — Doctor Appointment System (React Frontend)

Modern React + Vite frontend for the Spring Boot Doctor Appointment Management System.

**Backend:** `http://localhost:8080` (Spring Boot REST API + MySQL/PostgreSQL)  
**Frontend:** `http://localhost:5173` (Vite dev) / `http://localhost:3000` (Docker Nginx)

## Quick Start

```powershell
cd frontend-react
npm install
npm run dev
# open http://localhost:5173

npm run build   # production build -> dist/
npm run preview # preview production build
```

Backend must be running (`cd demo; .\mvnw.cmd spring-boot:run`) and MySQL reachable.

## Environment

```
VITE_API_BASE_URL=http://localhost:8080
```
If set with `/api` suffix it is auto-normalized.

## Routes

- `/` Home
- `/login` `/signup`
- `/doctors` `/book` `/appointments` `/dashboard`
- `/admin/login` `/admin/dashboard` `/admin/doctors` `/admin/bookings` (ROLE_ADMIN)
- `/doctor/login` `/doctor/dashboard` `/doctor/schedule` (ROLE_DOCTOR)
- `/patient/login` `/patient/dashboard` (ROLE_PATIENT)

Protected routes use `ProtectedRoute` + JWT from `AuthContext`.

## Tech Stack

- React 18, React Router 6, Vite 5
- Fetch API (centralized `src/services/api.js`)
- Shared design system `src/styles/shared.css` (ported from original HTML frontend)
- Strict ONLINE/OFFLINE doctor business rule enforced via backend (409 CONFLICT)

## Project Structure

```
src/
  components/Navbar, ProtectedRoute, DoctorCard, Loading
  context/AuthContext
  services/api.js
  pages/Home, Login, Signup, Doctors, BookAppointment, Appointments, Dashboard
  pages/admin/* , pages/doctor/* , pages/patient/*
  styles/shared.css
```

## Build

```
npm run build # → dist/ consumed by docker-compose nginx
docker-compose up --build # mysql + backend + frontend(nginx on 3000)
```
