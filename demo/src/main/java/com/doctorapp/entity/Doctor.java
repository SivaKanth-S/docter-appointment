package com.doctorapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Doctor name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Specialty is required")
    @Column(nullable = false)
    private String specialty;

    @NotNull(message = "Consultation mode (ONLINE or OFFLINE) is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConsultationMode mode;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private Double consultationFee = 500.0;

    private String availability = "Mon-Fri 09:00 - 17:00";

    private String clinicAddress;

    private String meetingPlatform = "Secure Telehealth Portal";

    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Doctor() {}

    public Doctor(Long id, String name, String specialty, ConsultationMode mode, String email, String phone, Double consultationFee, String clinicAddress) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.mode = mode;
        this.email = email;
        this.phone = phone;
        this.consultationFee = consultationFee;
        this.clinicAddress = clinicAddress;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public ConsultationMode getMode() {
        return mode;
    }

    public void setMode(ConsultationMode mode) {
        this.mode = mode;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getClinicAddress() {
        return clinicAddress;
    }

    public void setClinicAddress(String clinicAddress) {
        this.clinicAddress = clinicAddress;
    }

    public String getMeetingPlatform() {
        return meetingPlatform;
    }

    public void setMeetingPlatform(String meetingPlatform) {
        this.meetingPlatform = meetingPlatform;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
