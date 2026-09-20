package com.doctorapp.controller;

import com.doctorapp.entity.Slot;
import com.doctorapp.service.SlotService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class SlotController {

    @Autowired
    private SlotService slotService;

    @GetMapping("/api/doctors/{doctorId}/slots")
    public ResponseEntity<List<Slot>> getSlotsForDoctor(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        if (date != null) {
            return ResponseEntity.ok(slotService.getSlotsByDoctorAndDate(doctorId, date));
        }
        return ResponseEntity.ok(slotService.getSlotsByDoctor(doctorId));
    }

    @PostMapping("/api/slots")
    public ResponseEntity<Slot> createSlot(@Valid @RequestBody Slot slot) {
        Slot created = slotService.createSlot(slot);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @DeleteMapping("/api/slots/{id}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        slotService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }
}
