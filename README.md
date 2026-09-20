# 🏥 Doctor Appointment Management System
### Secure Online & Offline Medical Appointment Booking Platform (Use Case 2)

**College Project Expo 2026 Edition**  
*A complete end-to-end full stack healthcare system: Modern Web Frontend ➔ Spring Boot REST API ➔ PostgreSQL Database.*

---

## 🌟 Executive Summary

The **Doctor Appointment Management System** is an enterprise-grade medical scheduling platform tailored for hospital networks and telehealth providers. It delivers a comprehensive patient-doctor consultation workflow while strictly enforcing critical healthcare business rules.

### 🛡️ Mandatory Business Rule (Enforced at Backend & Database Level)
> **Online and Offline appointments must use strictly separate doctors.**  
> The backend validation engine prevents any doctor designated for `ONLINE` video consultations from being assigned or booked for `OFFLINE` in-clinic appointments, and vice-versa. Any violation immediately triggers an HTTP `409 CONFLICT` response.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | Vanilla HTML5, CSS3, ES6+ JavaScript | Modern healthcare theme, glassmorphism, responsive grid, dynamic DOM rendering, real-time filters |
| **Backend API** | Java 21, Spring Boot 3.3.4 | Layered MVC (`Controller` ➔ `Service` ➔ `Repository`), Maven build |
| **Persistence / ORM**| Spring Data JPA / Hibernate | PostgreSQL 16 relational database (with automated H2 in-memory demo compatibility) |
| **Security & Auth** | Spring Security 6, JWT, BCrypt | Token bucket rate limiting (429), Role-based authorization (`PATIENT`, `DOCTOR`, `ADMIN`) |
| **API Documentation**| SpringDoc OpenAPI 3 / Swagger UI | Interactive API explorer at `/swagger-ui/index.html` |
| **Containerization** | Docker & Docker Compose | Multi-container setup (`postgres`, `backend`, `frontend`) |

---

## 📁 Repository Structure

```
docter appointment/
├── demo/                                # Spring Boot Backend Maven Project
│   ├── pom.xml                          # Dependencies: Web, JPA, Security, JWT, Postgres, OpenAPI
│   ├── mvnw / mvnw.cmd                  # Maven Wrapper (zero install required)
│   ├── Dockerfile                       # Multi-stage container build
│   ├── src/
│   │   ├── main/java/com/doctorapp/
│   │   │   ├── config/                  # DatabaseInitializer, OpenApiConfig
│   │   │   ├── controller/              # Doctor, Appointment, Slot, Report, Auth Controllers
│   │   │   ├── dto/                     # DoctorDTO, AppointmentRequestDTO, DailySummaryDTO
│   │   │   ├── entity/                  # Doctor, Appointment, Slot, User, Enums
│   │   │   ├── exception/               # GlobalExceptionHandler (@RestControllerAdvice)
│   │   │   ├── repository/              # Spring Data JPA Repositories
│   │   │   ├── security/                # JwtTokenProvider, SecurityConfig, RateLimitingFilter
│   │   │   └── service/                 # Strict rule validation, double-booking prevention
│   │   └── resources/
│   │       ├── application.properties   # In-memory H2 demo profile (instant launch)
│   │       └── application-postgres.properties # PostgreSQL profile (production)
│   └── frontend/                        # Expo-Ready Web Interface
│       ├── index.html                   # Dashboard, Doctor management, Booking form, Appointment list
│       ├── style.css                    # Professional healthcare blue design system
│       └── script.js                    # Dynamic DOM updates, live search, status synchronization
├── docs/
│   └── architecture.md                  # System architecture, ER diagram, state machine diagrams
├── postman/
│   └── Doctor_Appointment_System.postman_collection.json # 20+ automated API test scenarios
├── docker-compose.yml                   # PostgreSQL 16 + Spring Boot + Nginx Compose stack
└── README.md                            # Comprehensive documentation & demo guide
```

---

## 🚀 Quick Start Guide

### Option 1: Instant Local Run (Recommended for College Expo)

#### 1. Start the Spring Boot Backend
Open a terminal in `demo/` and run:
```powershell
cd "demo"
.\mvnw.cmd spring-boot:run
```
*(On Linux/macOS, use `./mvnw spring-boot:run`)*

The backend will automatically start on **`http://localhost:8080`**, initialize the database tables, and preload realistic doctors, slots, and appointments.

#### 2. Open the Frontend
Simply double-click or open `demo/frontend/index.html` in any web browser (Chrome, Edge, Firefox), or launch via VS Code Live Server / Python HTTP server:
```powershell
cd "demo/frontend"
python -m http.server 3000
```
Visit: **`http://localhost:3000`** or open `demo/frontend/index.html` directly.

---

### Option 2: Run with Docker Compose (PostgreSQL 16)

```powershell
docker-compose up --build
```
This automatically boots:
- **PostgreSQL Database** on port `5432`
- **Spring Boot Backend** on port `8080`
- **Nginx Web Frontend** on port `3000`

---

## 🏆 25-Step College Project Expo Demonstration Walkthrough

Follow this scripted demonstration during the Expo to showcase full end-to-end integration:

1. **Open Dashboard**: Load `index.html` in browser. Observe the connection status showing **`Online (Connected)`**.
2. **Review Dynamic Cards**: Point out live counters:
   - **Total Doctors** (Pre-seeded with 9 specialists across 6 disciplines)
   - **Total Appointments** (5 active sample appointments)
   - **Online vs In-Clinic Breakdown**
   - **Live Revenue Calculation** in Rupees (`₹`)
3. **Doctor Search**: In the Doctor Management section, type `Sarah` or `Kumar` into the search box. Notice cards filter in real time.
4. **Specialty Filter**: Select `Cardiology` from the Specialty dropdown. Notice it instantly isolates Cardiologists.
5. **Mode Filter**: Select `Online Only`. Notice only doctors with the blue `💻 ONLINE` badge appear. Select `Offline / In-Clinic Only` to see hospital specialists.
6. **Add New Doctor**:
   - Click **`+ Add New Doctor`**.
   - Enter `Dr. Vignesh Natarajan`, Specialty: `Neurology`, Mode: `ONLINE`, Email: `dr.vignesh@medicare.org`.
   - Click **Save Doctor**.
   - Notice success toast, immediate addition to the Doctor Grid, increment of Total Doctors to 10, and instant inclusion in the booking dropdown!
7. **Demonstrate Strict Business Rule in Booking**:
   - Scroll to **Book Doctor Appointment**.
   - Select `Dr. Sarah Jenkins` (an `ONLINE` doctor).
   - Notice the consultation fee automatically previews as `₹850.00`.
   - Notice the Consultation Mode auto-locks to `💻 Online`.
8. **Test Rule Violation**:
   - If an API client or user attempts to book an `OFFLINE` appointment with `Dr. Sarah Jenkins`, show how the system rejects it with:  
     `Strict Mode Violation: Doctor 'Dr. Sarah Jenkins' is designated exclusively for ONLINE consultations, but OFFLINE was requested.`
9. **Book Valid Appointment**:
   - Enter Patient Name: `Kavitha Sundar`
   - Select Date: Tomorrow, Time: `10:00 AM`
   - Reason: `Routine cardiac hypertension review`
   - Click **Book Appointment**.
10. **Mode-Specific Confirmation Modal**:
    - A confirmation popup appears displaying Appointment ID `#APT-...`, doctor details, fee, and a **Direct Google Meet Video Room Link** with teleconsult instructions!
11. **Check Live Appointment List**:
    - Scroll down to the Appointment Management section.
    - Notice `Kavitha Sundar`'s appointment appears with default status **`Pending`**.
12. **Update Status in Real Time**:
    - On the appointment card, click the status dropdown and switch from `Pending` to **`Confirmed`**.
    - Notice the badge changes to blue and a toast confirms: *"Appointment status updated successfully!"*
    - Check the dashboard counters: Pending count decrements, Confirmed increments.
13. **Preservation of Fields**: Refresh the webpage. Notice all fields (`patientName`, `doctorName`, `appointmentDate`, `reason`) remain intact while the status persists as `Confirmed`.
14. **Transition to Completed**: Change status to `Completed`. Notice revenue metrics dynamically recalculate.
15. **Edit Appointment**: Click **Edit** on any card, adjust patient name or date, click **Update**, and watch it reflect immediately.
16. **Delete Appointment**: Click **Delete** on an appointment card, confirm deletion, and observe the card disappear and the dashboard counter decrement.
17. **Analytics & Daily Summary**:
    - Scroll to the Analytics section.
    - Review the **Consultation Mode Distribution** bar comparing Online vs In-Clinic percentages.
    - Review **Appointments by Specialty** progress charts.
    - Review the **Status Lifecycle Summary** grid.
18. **Open Swagger API Docs**: Navigate to **`http://localhost:8080/swagger-ui/index.html`** to show judges the complete OpenAPI 3 specification.
19. **Open Database Console**: Navigate to **`http://localhost:8080/h2-console`** (JDBC URL: `jdbc:h2:mem:doctor_db`, user: `postgres`, pass: `postgres`) and run `SELECT * FROM APPOINTMENTS;` to prove relational persistence.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token | Public |
| `POST` | `/api/auth/register` | Register new patient / doctor / admin | Public |
| `GET` | `/api/doctors` | Get all doctors (supports `?search=`, `?specialty=`, `?mode=`) | Public |
| `GET` | `/api/doctors/{id}` | Get doctor details by ID | Public |
| `POST` | `/api/doctors` | Add a new doctor | Protected / Admin |
| `PUT` | `/api/doctors/{id}` | Update doctor information | Protected / Admin |
| `DELETE` | `/api/doctors/{id}` | Delete doctor | Protected / Admin |
| `GET` | `/api/appointments` | Get all appointments (supports `?status=`, `?doctorId=`) | Public / Patient |
| `POST` | `/api/appointments` | Book appointment (Validates doctor existence, mode match & double-booking) | Public / Patient |
| `PUT` | `/api/appointments/{id}` | Update appointment details | Public / Patient |
| `PUT` | `/api/appointments/{id}/status` | Fast update of status preserving other fields | Public / Doctor |
| `POST` | `/api/appointments/{id}/confirm` | Transition status to `CONFIRMED` | Doctor / Admin |
| `POST` | `/api/appointments/{id}/complete` | Transition status to `COMPLETED` | Doctor / Admin |
| `POST` | `/api/appointments/{id}/cancel` | Transition status to `CANCELLED` & free slot | Patient / Admin |
| `DELETE` | `/api/appointments/{id}` | Delete appointment record | Admin |
| `GET` | `/api/reports/daily` | Get daily summary (Mode counts, status counts, revenue) | Public / Admin |
| `GET` | `/api/reports/revenue` | Get revenue analytics by mode | Public / Admin |
| `GET` | `/api/admin/dashboard` | Get complete system metrics | Admin |

---

## 🔑 Preloaded Test Credentials

| Role | Username | Password | Email |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | `admin@mediconnect.org` |
| **Doctor** | `drkumar` | `doctor123` | `drkumar@mediconnect.org` |
| **Patient** | `john_doe` | `patient123` | `john@example.com` |

---

## 🧪 Automated Unit & Integration Tests

Run the automated test suite verifying strict mode separation, double-booking prevention, status lifecycle transitions, and revenue calculations:
```powershell
cd "demo"
.\mvnw.cmd test
```
Result: **`Tests run: 6, Failures: 0, Errors: 0, Skipped: 0`** (100% Passing).

---

## 📬 Postman Collection

Import `postman/Doctor_Appointment_System.postman_collection.json` into Postman to test:
- Authentication & JWT token generation
- Doctor CRUD & filtering
- Strict Mode conflict assertion (`409 Conflict`)
- Slot booking & double-booking rejection
- Status transitions (`Pending` ➔ `Confirmed` ➔ `Completed`)
- Daily summary & revenue endpoints
