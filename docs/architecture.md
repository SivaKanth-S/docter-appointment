# System Architecture & Technical Specifications

**Project Name:** Doctor Appointment Management System — Secure Online & Offline Medical Appointment Booking Platform  
**Target Event:** College Project Expo 2026  
**Use Case:** Use Case 2 — Multi-Mode Medical Consultation with Strict Doctor Separation  

---

## 1. System Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer
        Browser["Modern Web Frontend\n(index.html, style.css, script.js)"]
        Postman["API Testing Client\n(Postman Collection)"]
        Swagger["OpenAPI / Swagger UI\n(/swagger-ui/index.html)"]
    end

    subgraph Security & Filter Pipeline
        RateLimiter["Rate Limiting Filter\n(Token Bucket 60 req/min)"]
        CORS["CORS & Frame Headers"]
        JWTFilter["JWT Authentication Filter\n(Bearer Token / BCrypt)"]
    end

    subgraph Spring Boot Backend Layer
        Controllers["REST Controllers\n(Doctor, Appointment, Slot, Report, Auth)"]
        ExceptionAdvisor["@RestControllerAdvice\n(Standard Error JSON: 400, 404, 409, 429)"]
        
        subgraph Business Service Layer
            DoctorService["Doctor Service\n(Mode Assignment & Active Toggling)"]
            AppointmentService["Appointment Service\n- Strict Mode Validation\n- Double-Booking Prevention\n- Lifecycle Transition Rules"]
            SlotService["Slot Management Service\n(Atomic Slot Locking)"]
            ReportService["Report & Analytics Service\n(Daily Summaries & Revenue)"]
            AuthService["Authentication Service\n(BCrypt & JWT Issuance)"]
        end
        
        subgraph Data Access Layer
            JPARepositories["Spring Data JPA Repositories\n(Doctor, Appointment, Slot, User)"]
        end
    end

    subgraph Persistence Layer
        DB[("PostgreSQL 16 Database\n(doctor_db)\nwith in-memory H2 Demo Compatibility")]
    end

    Browser -->|JSON over HTTP / Port 8080| RateLimiter
    Postman -->|JSON over HTTP| RateLimiter
    Swagger -->|REST Testing| RateLimiter

    RateLimiter --> CORS --> JWTFilter --> Controllers
    Controllers --> BusinessServiceLayer
    Controllers -.-> ExceptionAdvisor
    BusinessServiceLayer --> JPARepositories
    JPARepositories --> DB
```

---

## 2. Strict Online / Offline Doctor Separation Rule

```mermaid
flowchart TD
    Start([Patient Selects Doctor]) --> CheckDoctorMode{Doctor Mode in Database?}
    
    CheckDoctorMode -->|Mode = ONLINE| OnlineBranch[Doctor is Exclusively ONLINE]
    CheckDoctorMode -->|Mode = OFFLINE| OfflineBranch[Doctor is Exclusively OFFLINE]
    
    OnlineBranch --> PatientRequestsMode1{Patient Booking Request Mode?}
    PatientRequestsMode1 -->|Mode = ONLINE| ApproveOnline[Validate Slot & Date]
    PatientRequestsMode1 -->|Mode = OFFLINE| RejectOnline["❌ HTTP 409 Conflict!\nStrict Business Rule Violation:\nOnline doctor cannot be used for In-Clinic visit"]
    
    OfflineBranch --> PatientRequestsMode2{Patient Booking Request Mode?}
    PatientRequestsMode2 -->|Mode = OFFLINE| ApproveOffline[Validate Slot & Date]
    PatientRequestsMode2 -->|Mode = ONLINE| RejectOffline["❌ HTTP 409 Conflict!\nStrict Business Rule Violation:\nOffline doctor cannot be used for Video Consultation"]
    
    ApproveOnline --> DoubleBookingCheck{Check Existing Booking\nat same Doctor, Date, Time}
    ApproveOffline --> DoubleBookingCheck
    
    DoubleBookingCheck -->|Already Booked| RejectDuplicate["❌ HTTP 409 Conflict!\nSlot already occupied"]
    DoubleBookingCheck -->|Available| CreateAppointment[Create Appointment in DB]
    
    CreateAppointment --> GenerateConfirmation[Generate Mode-Specific Details]
    GenerateConfirmation --> OnlineInfo["ONLINE: Attach Video Telehealth Room Link"]
    GenerateConfirmation --> OfflineInfo["OFFLINE: Attach Hospital OPD Cabin Location"]
```

---

## 3. Database Entity Relationship (ER) Diagram

```mermaid
erDiagram
    DOCTORS ||--o{ APPOINTMENTS : "assigned to"
    DOCTORS ||--o{ SLOTS : "opens"
    SLOTS |o--o| APPOINTMENTS : "reserves"
    
    DOCTORS {
        bigint id PK
        varchar name
        varchar specialty
        varchar mode "ONLINE | OFFLINE (Strict)"
        varchar email UK
        varchar phone
        double precision consultation_fee
        varchar availability
        varchar clinic_address
        varchar meeting_platform
        boolean active
        timestamp created_at
    }

    APPOINTMENTS {
        bigint id PK
        varchar patient_name
        varchar patient_email
        varchar patient_phone
        bigint doctor_id FK
        varchar doctor_name
        varchar specialty
        varchar mode "ONLINE | OFFLINE"
        date appointment_date
        varchar appointment_time
        text reason
        varchar status "PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW"
        double precision consultation_fee
        varchar meeting_link
        varchar clinic_address
        bigint slot_id FK
        timestamp created_at
        timestamp updated_at
    }

    SLOTS {
        bigint id PK
        bigint doctor_id FK
        varchar doctor_name
        date date
        varchar start_time
        varchar end_time
        varchar mode "ONLINE | OFFLINE"
        boolean available
    }

    USERS {
        bigint id PK
        varchar username UK
        varchar password "BCrypt Encrypted"
        varchar email UK
        varchar role "ROLE_PATIENT | ROLE_DOCTOR | ROLE_ADMIN"
        boolean enabled
    }
```

---

## 4. Appointment Status Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Patient Books Slot
    
    PENDING --> CONFIRMED: Doctor / Reception Confirms
    PENDING --> CANCELLED: Patient / Clinic Cancels
    
    CONFIRMED --> COMPLETED: Consultation Finished
    CONFIRMED --> CANCELLED: Cancelled with Notice
    CONFIRMED --> NO_SHOW: Patient Did Not Attend
    
    COMPLETED --> [*]: Archived / Invoiced (Cannot Cancel)
    CANCELLED --> [*]: Slot Released (Cannot Reactivate)
    NO_SHOW --> [*]: Penalty Logged
```

---

## 5. Summary & Revenue Calculation Flow

```
Total Revenue = SUM(consultation_fee) WHERE status != 'CANCELLED'
Online Revenue = SUM(consultation_fee) WHERE mode = 'ONLINE' AND status != 'CANCELLED'
Offline Revenue = SUM(consultation_fee) WHERE mode = 'OFFLINE' AND status != 'CANCELLED'

Mode Ratio = (Online Appointments / Total Active Appointments) * 100
Specialty Breakdown = COUNT(*) GROUP BY specialty
```
