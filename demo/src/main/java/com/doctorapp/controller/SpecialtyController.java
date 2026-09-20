package com.doctorapp.controller;

import com.doctorapp.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/specialties")
@CrossOrigin(origins = "*")
public class SpecialtyController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<String>> getAllSpecialties() {
        return ResponseEntity.ok(doctorService.getAllSpecialties());
    }
}
