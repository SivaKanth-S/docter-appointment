package com.doctorapp.controller;

import com.doctorapp.dto.DailySummaryDTO;
import com.doctorapp.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<DailySummaryDTO> getDailyReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(reportService.getDailySummary(date));
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport() {
        return ResponseEntity.ok(reportService.getRevenueAnalytics());
    }

    @GetMapping("/appointments-by-mode")
    public ResponseEntity<Map<String, Long>> getAppointmentsByMode() {
        return ResponseEntity.ok(reportService.getAppointmentsByMode());
    }

    @GetMapping("/appointments-by-specialty")
    public ResponseEntity<Map<String, Long>> getAppointmentsBySpecialty() {
        return ResponseEntity.ok(reportService.getAppointmentsBySpecialty());
    }
}
