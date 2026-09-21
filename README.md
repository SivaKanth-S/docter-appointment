# 🏥 MediConnect – Doctor Appointment Management System

### Secure Online & Offline Medical Appointment Booking Platform

MediConnect is a full-stack healthcare appointment system that enables patients to discover doctors, select available appointments, and manage bookings through Online and Offline consultation modes.

## 🚀 Key Features

- Doctor and patient management
- Specialty-based doctor search and filtering
- Online and Offline appointment booking
- Doctor availability and slot management
- Appointment status tracking
- Strict Online/Offline doctor separation
- Daily appointment and revenue summaries
- REST APIs with Swagger documentation
- JWT-based authentication and role-based access
- mySQL database integration
- Responsive healthcare-focused interface

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Java, Spring Boot |
| Database | mySQL |
| ORM | Spring Data JPA / Hibernate |
| Security | Spring Security, JWT, BCrypt |
| API Documentation | Swagger / OpenAPI |
| Deployment | Docker / Docker Compose |

## 🏗️ Architecture

```text
Frontend
   ↓
Spring Boot REST API
   ↓
Service Layer
   ↓
Repository / JPA
   ↓
PostgreSQL
