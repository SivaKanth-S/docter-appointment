package com.doctorapp.dto;

import com.doctorapp.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public class AppointmentStatusUpdateDTO {

    @NotNull(message = "Status cannot be null")
    private AppointmentStatus status;

    public AppointmentStatusUpdateDTO() {}

    public AppointmentStatusUpdateDTO(AppointmentStatus status) {
        this.status = status;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }
}
