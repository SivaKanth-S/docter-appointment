package com.doctorapp.controller;

import com.doctorapp.dto.AppointmentRequestDTO;
import com.doctorapp.dto.AppointmentStatusUpdateDTO;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.AppointmentStatus;
import com.doctorapp.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        if (status != null) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByStatus(status));
        }
        if (doctorId != null) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId));
        }
        if (date != null) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByDate(date));
        }
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@Valid @RequestBody AppointmentRequestDTO requestDTO) {
        Appointment appointment = appointmentService.createAppointment(requestDTO);
        return new ResponseEntity<>(appointment, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable Long id,
            @RequestBody Appointment appointment
    ) {
        Appointment updated = appointmentService.updateAppointment(id, appointment);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusUpdateDTO statusDTO
    ) {
        Appointment updated = appointmentService.updateStatus(id, statusDTO.getStatus());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Appointment> confirmAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, AppointmentStatus.CONFIRMED));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Appointment> completeAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, AppointmentStatus.COMPLETED));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, AppointmentStatus.CANCELLED));
    }

    @PostMapping("/{id}/no-show")
    public ResponseEntity<Appointment> markNoShow(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, AppointmentStatus.NO_SHOW));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
