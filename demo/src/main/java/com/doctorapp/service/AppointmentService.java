package com.doctorapp.service;

import com.doctorapp.dto.AppointmentRequestDTO;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.AppointmentStatus;
import com.doctorapp.entity.ConsultationMode;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Slot;
import com.doctorapp.exception.BusinessRuleException;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.exception.SlotAlreadyBookedException;
import com.doctorapp.repository.AppointmentRepository;
import com.doctorapp.repository.DoctorRepository;
import com.doctorapp.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SlotRepository slotRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    public List<Appointment> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    /**
     * Creates and books an appointment with strict business validations:
     * 1. Doctor verification
     * 2. STRICT RULE: Online and Offline appointments must use different doctors.
     * 3. Double-booking prevention for slot/date/time.
     * 4. Slot occupancy lock.
     * 5. Mode-specific details attachment.
     */
    public Appointment createAppointment(AppointmentRequestDTO dto) {
        Doctor doctor = null;

        // Resolve doctor by ID or by Name
        if (dto.getDoctorId() != null) {
            doctor = doctorRepository.findById(dto.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + dto.getDoctorId()));
        } else if (dto.getDoctorName() != null && !dto.getDoctorName().trim().isEmpty()) {
            String search = dto.getDoctorName().trim();
            doctor = doctorRepository.findByNameContainingIgnoreCase(search).stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with name: " + dto.getDoctorName()));
        } else {
            throw new BusinessRuleException("Please select a doctor for the appointment.");
        }

        ConsultationMode requestedMode = dto.getMode() != null ? dto.getMode() : doctor.getMode();

        // STRICT BUSINESS RULE: Online and Offline appointments must use different doctors.
        // A doctor designated for Online consultations cannot be booked for Offline, and vice-versa.
        if (doctor.getMode() != requestedMode) {
            throw new BusinessRuleException(String.format(
                    "Strict Mode Violation: Doctor '%s' is designated exclusively for %s consultations, but %s was requested.",
                    doctor.getName(), doctor.getMode(), requestedMode
            ));
        }

        // Prevent double booking at the same date and time for the doctor
        boolean alreadyBooked = appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                doctor.getId(), dto.getAppointmentDate(), dto.getAppointmentTime(), AppointmentStatus.CANCELLED
        );

        if (alreadyBooked) {
            throw new SlotAlreadyBookedException(String.format(
                    "Doctor '%s' already has a booked appointment on %s at %s. Please select a different time slot.",
                    doctor.getName(), dto.getAppointmentDate(), dto.getAppointmentTime()
            ));
        }

        // Check and mark slot unavailable if slot ID was passed
        if (dto.getSlotId() != null) {
            Slot slot = slotRepository.findById(dto.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + dto.getSlotId()));

            if (!slot.getAvailable()) {
                throw new SlotAlreadyBookedException("Selected slot is no longer available.");
            }
            slot.setAvailable(false);
            slotRepository.save(slot);
        }

        Appointment appointment = new Appointment();
        appointment.setPatientName(dto.getPatientName());
        appointment.setPatientEmail(dto.getPatientEmail());
        appointment.setPatientPhone(dto.getPatientPhone());
        appointment.setDoctorId(doctor.getId());
        appointment.setDoctorName(doctor.getName());
        appointment.setSpecialty(doctor.getSpecialty());
        appointment.setMode(doctor.getMode());
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        appointment.setReason(dto.getReason());
        appointment.setStatus(AppointmentStatus.PENDING); // Default status: Pending
        appointment.setConsultationFee(doctor.getConsultationFee());
        appointment.setSlotId(dto.getSlotId());
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());

        // Attach mode-specific confirmation details
        if (doctor.getMode() == ConsultationMode.ONLINE) {
            String meetingCode = UUID.randomUUID().toString().substring(0, 8);
            appointment.setMeetingLink("https://telehealth.mediconnect.org/room/" + meetingCode);
            appointment.setClinicAddress("Online Telehealth Consultation Portal");
        } else {
            appointment.setClinicAddress(doctor.getClinicAddress() != null ?
                    doctor.getClinicAddress() : "Cabin 104, Metro Hospital & Medical Research Center, Chennai");
            appointment.setMeetingLink(null);
        }

        return appointmentRepository.save(appointment);
    }

    /**
     * Fast and safe status update for dropdowns.
     * Validates lifecycle transitions and preserves all other fields.
     */
    public Appointment updateStatus(Long id, AppointmentStatus newStatus) {
        Appointment appointment = getAppointmentById(id);
        AppointmentStatus currentStatus = appointment.getStatus();

        // Lifecycle validation
        if (currentStatus == AppointmentStatus.CANCELLED && newStatus != AppointmentStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot reactivate a CANCELLED appointment.");
        }
        if (currentStatus == AppointmentStatus.COMPLETED && newStatus == AppointmentStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot cancel an already COMPLETED appointment.");
        }

        // If transitioning to CANCELLED and a slot was associated, free the slot
        if (newStatus == AppointmentStatus.CANCELLED && appointment.getSlotId() != null) {
            slotRepository.findById(appointment.getSlotId()).ifPresent(slot -> {
                slot.setAvailable(true);
                slotRepository.save(slot);
            });
        }

        appointment.setStatus(newStatus);
        return appointmentRepository.save(appointment);
    }

    /**
     * Edit full appointment details while safely preserving unchanged values.
     */
    public Appointment updateAppointment(Long id, Appointment updatedData) {
        Appointment existing = getAppointmentById(id);

        if (updatedData.getPatientName() != null && !updatedData.getPatientName().trim().isEmpty()) {
            existing.setPatientName(updatedData.getPatientName().trim());
        }
        if (updatedData.getDoctorName() != null && !updatedData.getDoctorName().trim().isEmpty()) {
            existing.setDoctorName(updatedData.getDoctorName().trim());
        }
        if (updatedData.getAppointmentDate() != null) {
            existing.setAppointmentDate(updatedData.getAppointmentDate());
        }
        if (updatedData.getAppointmentTime() != null && !updatedData.getAppointmentTime().trim().isEmpty()) {
            existing.setAppointmentTime(updatedData.getAppointmentTime().trim());
        }
        if (updatedData.getReason() != null && !updatedData.getReason().trim().isEmpty()) {
            existing.setReason(updatedData.getReason().trim());
        }
        if (updatedData.getStatus() != null) {
            existing.setStatus(updatedData.getStatus());
        }
        if (updatedData.getMode() != null) {
            existing.setMode(updatedData.getMode());
        }

        return appointmentRepository.save(existing);
    }

    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);
        if (appointment.getSlotId() != null) {
            slotRepository.findById(appointment.getSlotId()).ifPresent(slot -> {
                slot.setAvailable(true);
                slotRepository.save(slot);
            });
        }
        appointmentRepository.delete(appointment);
    }

    public long countTotalAppointments() {
        return appointmentRepository.count();
    }
}
