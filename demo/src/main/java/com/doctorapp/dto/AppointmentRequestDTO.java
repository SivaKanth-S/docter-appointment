package com.doctorapp.dto;

import com.doctorapp.entity.ConsultationMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AppointmentRequestDTO {

    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotBlank(message = "Patient email is required")
    @Email(message = "Patient email must be valid")
    private String patientEmail;

    @NotBlank(message = "Patient phone is required")
    private String patientPhone;

    @NotBlank(message = "Patient gender is required")
    private String patientGender;

    // Doctor can be specified by ID or Name
    private Long doctorId;

    private String doctorName;

    private ConsultationMode mode;

    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;

    @NotBlank(message = "Appointment time is required")
    private String appointmentTime;

    @NotBlank(message = "Reason for appointment is required")
    private String reason;

    private Long slotId;

    public AppointmentRequestDTO() {}

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientEmail() {
        return patientEmail;
    }

    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }

    public String getPatientPhone() {
        return patientPhone;
    }

    public void setPatientPhone(String patientPhone) {
        this.patientPhone = patientPhone;
    }

    public String getPatientGender() {
        return patientGender;
    }

    public void setPatientGender(String patientGender) {
        this.patientGender = patientGender;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public ConsultationMode getMode() {
        return mode;
    }

    public void setMode(ConsultationMode mode) {
        this.mode = mode;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public String getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(String appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }
}
