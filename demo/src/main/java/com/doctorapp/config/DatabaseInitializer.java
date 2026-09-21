package com.doctorapp.config;

import com.doctorapp.entity.*;
import com.doctorapp.repository.AppointmentRepository;
import com.doctorapp.repository.DoctorRepository;
import com.doctorapp.repository.SlotRepository;
import com.doctorapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Only seed if empty
        if (doctorRepository.count() == 0) {
            seedUsers();
            seedDoctorsAndSlots();
            seedAppointments();
        }
        // Always ensure every doctor in the list has a login (idempotent, works on existing DBs too)
        ensureDoctorLogins();
    }

    private void createOrUpdateDoctorUser(String username, String rawPassword, String email) {
        String encoded = passwordEncoder.encode(rawPassword);
        userRepository.findByUsername(username).ifPresentOrElse(user -> {
            // Reset to known password so <doctorname>123 always works, keep ROLE_DOCTOR
            user.setPassword(encoded);
            user.setEmail(email);
            user.setRole("ROLE_DOCTOR");
            user.setEnabled(true);
            userRepository.save(user);
        }, () -> {
            // Avoid duplicate email clash (e.g. legacy drkumar uses same email as drrajesh)
            if (email != null && userRepository.existsByEmail(email)) {
                userRepository.findByEmail(email).ifPresent(existing -> {
                    existing.setPassword(encoded);
                    existing.setRole("ROLE_DOCTOR");
                    existing.setEnabled(true);
                    userRepository.save(existing);
                });
                // Still create the username-based login with a unique email key if needed
                if (!userRepository.existsByUsername(username)) {
                    User u = new User(username, encoded, username + "@mediconnect.org", "ROLE_DOCTOR");
                    userRepository.save(u);
                }
            } else {
                User u = new User(username, encoded, email, "ROLE_DOCTOR");
                userRepository.save(u);
            }
        });
    }

    private void ensureDoctorLogins() {
        // One login per doctor in the doctor list. Password = <firstname>123  (e.g. sarah123)
        // Username = dr<firstname>  (e.g. drsarah)
        String[][] logins = {
            {"drsarah", "sarah123", "sarah.jenkins@mediconnect.org"},
            {"drvikram", "vikram123", "vikram.malhotra@mediconnect.org"},
            {"drpriya", "priya123", "priya.sharma@mediconnect.org"},
            {"drrajesh", "rajesh123", "rajesh.kumar@mediconnect.org"},
            {"drarun", "arun123", "arun.kumar@metrohospital.org"},
            {"drmeera", "meera123", "meera.nambiar@metrohospital.org"},
            {"drananya", "ananya123", "ananya.roy@metrohospital.org"},
            {"drdavid", "david123", "david.wilson@metrohospital.org"},
            {"drsunita", "sunita123", "sunita.patel@metrohospital.org"},
        };
        for (String[] row : logins) {
            try {
                createOrUpdateDoctorUser(row[0], row[1], row[2]);
            } catch (Exception ignored) {
                // best-effort: never block app startup because of a single login row
            }
        }
        // Keep legacy demo login working: drkumar / doctor123 -> Dr. Rajesh Kumar
        try {
            if (!userRepository.existsByUsername("drkumar")) {
                User legacy = new User("drkumar", passwordEncoder.encode("doctor123"), "drkumar@mediconnect.org", "ROLE_DOCTOR");
                userRepository.save(legacy);
            }
        } catch (Exception ignored) {}
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User admin = new User("admin", passwordEncoder.encode("admin123"), "admin@mediconnect.org", "ROLE_ADMIN");
            User doctor = new User("drkumar", passwordEncoder.encode("doctor123"), "drkumar@mediconnect.org", "ROLE_DOCTOR");
            User patient = new User("john_doe", passwordEncoder.encode("patient123"), "john@example.com", "ROLE_PATIENT");
            userRepository.save(admin);
            userRepository.save(doctor);
            userRepository.save(patient);
        }
    }

    private void seedDoctorsAndSlots() {
        // ONLINE DOCTORS (Strictly Online Consultations)
        Doctor d1 = new Doctor(null, "Dr. Sarah Jenkins", "Cardiology", ConsultationMode.ONLINE, "sarah.jenkins@mediconnect.org", "+91 98401 11223", 850.0, null);
        d1.setAvailability("Mon-Fri 10:00 - 16:00");
        d1.setMeetingPlatform("Google Meet / Telehealth Portal");
        d1 = doctorRepository.save(d1);

        Doctor d2 = new Doctor(null, "Dr. Vikram Malhotra", "Neurology", ConsultationMode.ONLINE, "vikram.malhotra@mediconnect.org", "+91 98402 22334", 1100.0, null);
        d2.setAvailability("Tue-Sat 14:00 - 19:00");
        d2.setMeetingPlatform("Zoom Telehealth Room 4");
        d2 = doctorRepository.save(d2);

        Doctor d3 = new Doctor(null, "Dr. Priya Sharma", "Dermatology", ConsultationMode.ONLINE, "priya.sharma@mediconnect.org", "+91 98403 33445", 650.0, null);
        d3.setAvailability("Mon-Wed 09:00 - 13:00");
        d3.setMeetingPlatform("MediConnect Secure Portal");
        d3 = doctorRepository.save(d3);

        Doctor d4 = new Doctor(null, "Dr. Rajesh Kumar", "General Medicine", ConsultationMode.ONLINE, "rajesh.kumar@mediconnect.org", "+91 98404 44556", 500.0, null);
        d4.setAvailability("Mon-Sat 16:00 - 20:00");
        d4.setMeetingPlatform("Google Meet Direct");
        d4 = doctorRepository.save(d4);

        // OFFLINE DOCTORS (Strictly In-Clinic Appointments)
        Doctor d5 = new Doctor(null, "Dr. Arun Kumar", "Cardiology", ConsultationMode.OFFLINE, "arun.kumar@metrohospital.org", "+91 94441 55667", 900.0, "Cabin 204, Apollo Heart Center, Greams Road, Chennai");
        d5.setAvailability("Mon-Sat 09:00 - 14:00");
        d5 = doctorRepository.save(d5);

        Doctor d6 = new Doctor(null, "Dr. Meera Nambiar", "Neurology", ConsultationMode.OFFLINE, "meera.nambiar@metrohospital.org", "+91 94442 66778", 1250.0, "Neuro OPD Block 3, City Specialty Hospital, Chennai");
        d6.setAvailability("Mon-Fri 10:00 - 15:00");
        d6 = doctorRepository.save(d6);

        Doctor d7 = new Doctor(null, "Dr. Ananya Roy", "Dermatology", ConsultationMode.OFFLINE, "ananya.roy@metrohospital.org", "+91 94443 77889", 750.0, "Skin & Laser Clinic, Suite 102, Fortis Malar, Chennai");
        d7.setAvailability("Tue-Sat 11:00 - 17:00");
        d7 = doctorRepository.save(d7);

        Doctor d8 = new Doctor(null, "Dr. David Wilson", "Orthopedics", ConsultationMode.OFFLINE, "david.wilson@metrohospital.org", "+91 94444 88990", 800.0, "Orthopedic Wing B, Global Health City, Chennai");
        d8.setAvailability("Mon-Fri 08:30 - 13:30");
        d8 = doctorRepository.save(d8);

        Doctor d9 = new Doctor(null, "Dr. Sunita Patel", "Pediatrics", ConsultationMode.OFFLINE, "sunita.patel@metrohospital.org", "+91 94445 99001", 600.0, "Child Care Center, Rainbow Children's Hospital, Chennai");
        d9.setAvailability("Mon-Sat 09:30 - 16:30");
        d9 = doctorRepository.save(d9);

        // Pre-create some available slots
        LocalDate today = LocalDate.now();
        slotRepository.save(new Slot(d1.getId(), d1.getName(), today, "10:00 AM", "10:30 AM", ConsultationMode.ONLINE));
        slotRepository.save(new Slot(d1.getId(), d1.getName(), today, "11:00 AM", "11:30 AM", ConsultationMode.ONLINE));
        slotRepository.save(new Slot(d2.getId(), d2.getName(), today, "02:30 PM", "03:00 PM", ConsultationMode.ONLINE));
        slotRepository.save(new Slot(d5.getId(), d5.getName(), today, "09:30 AM", "10:00 AM", ConsultationMode.OFFLINE));
        slotRepository.save(new Slot(d5.getId(), d5.getName(), today, "10:30 AM", "11:00 AM", ConsultationMode.OFFLINE));
        slotRepository.save(new Slot(d6.getId(), d6.getName(), today, "11:00 AM", "11:30 AM", ConsultationMode.OFFLINE));
    }

    private void seedAppointments() {
        LocalDate today = LocalDate.now();

        // 1. Confirmed Online Appointment
        Appointment a1 = new Appointment();
        a1.setPatientName("Ramesh Chandran");
        a1.setPatientEmail("ramesh.c@gmail.com");
        a1.setPatientPhone("+91 98410 23456");
        a1.setDoctorId(1L);
        a1.setDoctorName("Dr. Sarah Jenkins");
        a1.setSpecialty("Cardiology");
        a1.setMode(ConsultationMode.ONLINE);
        a1.setAppointmentDate(today);
        a1.setAppointmentTime("10:00 AM");
        a1.setReason("Follow-up on ECG report and mild chest tightness");
        a1.setStatus(AppointmentStatus.CONFIRMED);
        a1.setConsultationFee(850.0);
        a1.setMeetingLink("https://telehealth.mediconnect.org/room/cardio-live-891");
        a1.setClinicAddress("Online Telehealth Consultation Portal");
        a1.setCreatedAt(LocalDateTime.now().minusHours(4));
        appointmentRepository.save(a1);

        // 2. Pending Online Appointment
        Appointment a2 = new Appointment();
        a2.setPatientName("Sneha Kulkarni");
        a2.setPatientEmail("sneha.k@outlook.com");
        a2.setPatientPhone("+91 98410 78901");
        a2.setDoctorId(3L);
        a2.setDoctorName("Dr. Priya Sharma");
        a2.setSpecialty("Dermatology");
        a2.setMode(ConsultationMode.ONLINE);
        a2.setAppointmentDate(today.plusDays(1));
        a2.setAppointmentTime("11:30 AM");
        a2.setReason("Allergic skin rash consultation");
        a2.setStatus(AppointmentStatus.PENDING);
        a2.setConsultationFee(650.0);
        a2.setMeetingLink("https://telehealth.mediconnect.org/room/derma-care-432");
        a2.setClinicAddress("Online Telehealth Consultation Portal");
        a2.setCreatedAt(LocalDateTime.now().minusHours(2));
        appointmentRepository.save(a2);

        // 3. Completed Offline Appointment
        Appointment a3 = new Appointment();
        a3.setPatientName("Karthik Sundaram");
        a3.setPatientEmail("karthik.s@gmail.com");
        a3.setPatientPhone("+91 94440 12389");
        a3.setDoctorId(5L);
        a3.setDoctorName("Dr. Arun Kumar");
        a3.setSpecialty("Cardiology");
        a3.setMode(ConsultationMode.OFFLINE);
        a3.setAppointmentDate(today.minusDays(1));
        a3.setAppointmentTime("09:30 AM");
        a3.setReason("Routine hypertension check-up and blood pressure monitoring");
        a3.setStatus(AppointmentStatus.COMPLETED);
        a3.setConsultationFee(900.0);
        a3.setClinicAddress("Cabin 204, Apollo Heart Center, Greams Road, Chennai");
        a3.setCreatedAt(LocalDateTime.now().minusDays(1));
        appointmentRepository.save(a3);

        // 4. Confirmed Offline Appointment
        Appointment a4 = new Appointment();
        a4.setPatientName("Divya Balakrishnan");
        a4.setPatientEmail("divya.b@yahoo.com");
        a4.setPatientPhone("+91 94440 98765");
        a4.setDoctorId(6L);
        a4.setDoctorName("Dr. Meera Nambiar");
        a4.setSpecialty("Neurology");
        a4.setMode(ConsultationMode.OFFLINE);
        a4.setAppointmentDate(today);
        a4.setAppointmentTime("02:00 PM");
        a4.setReason("Chronic migraine and dizziness consultation");
        a4.setStatus(AppointmentStatus.CONFIRMED);
        a4.setConsultationFee(1250.0);
        a4.setClinicAddress("Neuro OPD Block 3, City Specialty Hospital, Chennai");
        a4.setCreatedAt(LocalDateTime.now().minusHours(5));
        appointmentRepository.save(a4);

        // 5. Cancelled Appointment
        Appointment a5 = new Appointment();
        a5.setPatientName("Manoj Varma");
        a5.setPatientEmail("manoj.v@gmail.com");
        a5.setPatientPhone("+91 97900 11223");
        a5.setDoctorId(8L);
        a5.setDoctorName("Dr. David Wilson");
        a5.setSpecialty("Orthopedics");
        a5.setMode(ConsultationMode.OFFLINE);
        a5.setAppointmentDate(today.minusDays(2));
        a5.setAppointmentTime("11:00 AM");
        a5.setReason("Ankle sprain physiotherapy review");
        a5.setStatus(AppointmentStatus.CANCELLED);
        a5.setConsultationFee(800.0);
        a5.setClinicAddress("Orthopedic Wing B, Global Health City, Chennai");
        a5.setCreatedAt(LocalDateTime.now().minusDays(2));
        appointmentRepository.save(a5);
    }
}
