package com.doctorapp;

import com.doctorapp.dto.AppointmentRequestDTO;
import com.doctorapp.dto.DoctorDTO;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.AppointmentStatus;
import com.doctorapp.entity.ConsultationMode;
import com.doctorapp.entity.Doctor;
import com.doctorapp.exception.BusinessRuleException;
import com.doctorapp.exception.SlotAlreadyBookedException;
import com.doctorapp.service.AppointmentService;
import com.doctorapp.service.DoctorService;
import com.doctorapp.service.ReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class DoctorAppointmentApplicationTests {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private ReportService reportService;

    @Test
    @DisplayName("Context Loads Successfully")
    void contextLoads() {
        assertNotNull(doctorService);
        assertNotNull(appointmentService);
        assertNotNull(reportService);
    }

    @Test
    @DisplayName("Test 1: Doctor CRUD and Retrieval")
    void testDoctorCreationAndRetrieval() {
        DoctorDTO dto = new DoctorDTO();
        dto.setName("Dr. Test Cardiologist");
        dto.setSpecialty("Cardiology");
        dto.setMode(ConsultationMode.ONLINE);
        dto.setEmail("test.cardio@example.com");
        dto.setPhone("+91 90000 11111");
        dto.setConsultationFee(750.0);

        Doctor saved = doctorService.createDoctor(dto);
        assertNotNull(saved.getId());
        assertEquals("Dr. Test Cardiologist", saved.getName());
        assertEquals(ConsultationMode.ONLINE, saved.getMode());

        List<Doctor> onlineDoctors = doctorService.getDoctorsByMode(ConsultationMode.ONLINE);
        assertTrue(onlineDoctors.stream().anyMatch(d -> d.getId().equals(saved.getId())));
    }

    @Test
    @DisplayName("Test 2: Strict Rule - Online Doctor Cannot Be Booked for Offline Consultation")
    void testStrictOnlineOfflineDoctorSeparation() {
        // Find an ONLINE doctor
        Doctor onlineDoc = doctorService.getDoctorsByMode(ConsultationMode.ONLINE).get(0);
        assertEquals(ConsultationMode.ONLINE, onlineDoc.getMode());

        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setPatientName("Aravind Swamy");
        request.setDoctorId(onlineDoc.getId());
        request.setDoctorName(onlineDoc.getName());
        request.setMode(ConsultationMode.OFFLINE); // CONFLICT: doctor is ONLINE!
        request.setAppointmentDate(LocalDate.now().plusDays(5));
        request.setAppointmentTime("04:00 PM");
        request.setReason("General checkup");

        // Must throw BusinessRuleException
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> {
            appointmentService.createAppointment(request);
        });

        assertTrue(ex.getMessage().contains("Strict Mode Violation"));
    }

    @Test
    @DisplayName("Test 3: Double Booking Prevention on Same Date and Time")
    void testDoubleBookingPrevention() {
        Doctor doc = doctorService.getAllDoctors().get(0);
        LocalDate date = LocalDate.now().plusDays(10);
        String time = "03:00 PM";

        AppointmentRequestDTO req1 = new AppointmentRequestDTO();
        req1.setPatientName("Patient One");
        req1.setDoctorId(doc.getId());
        req1.setDoctorName(doc.getName());
        req1.setMode(doc.getMode());
        req1.setAppointmentDate(date);
        req1.setAppointmentTime(time);
        req1.setReason("First appointment");

        Appointment a1 = appointmentService.createAppointment(req1);
        assertNotNull(a1.getId());

        // Attempt second booking with same doctor, date, and time
        AppointmentRequestDTO req2 = new AppointmentRequestDTO();
        req2.setPatientName("Patient Two");
        req2.setDoctorId(doc.getId());
        req2.setDoctorName(doc.getName());
        req2.setMode(doc.getMode());
        req2.setAppointmentDate(date);
        req2.setAppointmentTime(time);
        req2.setReason("Second concurrent appointment");

        assertThrows(SlotAlreadyBookedException.class, () -> {
            appointmentService.createAppointment(req2);
        });
    }

    @Test
    @DisplayName("Test 4: Status Lifecycle and Field Preservation")
    void testStatusLifecycleAndFieldPreservation() {
        Doctor doc = doctorService.getAllDoctors().get(0);
        AppointmentRequestDTO req = new AppointmentRequestDTO();
        req.setPatientName("Vijay Kumar");
        req.setDoctorId(doc.getId());
        req.setDoctorName(doc.getName());
        req.setMode(doc.getMode());
        req.setAppointmentDate(LocalDate.now().plusDays(3));
        req.setAppointmentTime("05:00 PM");
        req.setReason("Severe headache");

        Appointment appt = appointmentService.createAppointment(req);
        assertEquals(AppointmentStatus.PENDING, appt.getStatus());

        // Transition: PENDING -> CONFIRMED
        Appointment confirmed = appointmentService.updateStatus(appt.getId(), AppointmentStatus.CONFIRMED);
        assertEquals(AppointmentStatus.CONFIRMED, confirmed.getStatus());
        assertEquals("Vijay Kumar", confirmed.getPatientName());
        assertEquals("Severe headache", confirmed.getReason());

        // Transition: CONFIRMED -> CANCELLED
        Appointment cancelled = appointmentService.updateStatus(appt.getId(), AppointmentStatus.CANCELLED);
        assertEquals(AppointmentStatus.CANCELLED, cancelled.getStatus());

        // Invalid Transition: CANCELLED cannot be reactivated
        assertThrows(BusinessRuleException.class, () -> {
            appointmentService.updateStatus(appt.getId(), AppointmentStatus.CONFIRMED);
        });
    }

    @Test
    @DisplayName("Test 5: Daily Summary & Revenue Calculation")
    void testDailySummaryReport() {
        var summary = reportService.getDailySummary(LocalDate.now());
        assertNotNull(summary);
        assertTrue(summary.getTotalAppointments() > 0);
        assertTrue(summary.getTotalDoctors() > 0);
        assertTrue(summary.getTotalRevenue() > 0.0);
    }
}
