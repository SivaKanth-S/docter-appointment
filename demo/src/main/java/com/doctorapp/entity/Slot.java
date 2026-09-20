package com.doctorapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "slots")
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private String doctorName;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Start time is required")
    private String startTime;

    private String endTime;

    @NotNull(message = "Mode is required")
    @Enumerated(EnumType.STRING)
    private ConsultationMode mode;

    private Boolean available = true;

    public Slot() {}

    public Slot(Long doctorId, String doctorName, LocalDate date, String startTime, String endTime, ConsultationMode mode) {
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.mode = mode;
        this.available = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public ConsultationMode getMode() {
        return mode;
    }

    public void setMode(ConsultationMode mode) {
        this.mode = mode;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }
}
