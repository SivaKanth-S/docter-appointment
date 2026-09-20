package com.doctorapp.controller;

import com.doctorapp.dto.AuthResponseDTO;
import com.doctorapp.dto.LoginRequestDTO;
import com.doctorapp.entity.User;
import com.doctorapp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        AuthResponseDTO response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody User user) {
        AuthResponseDTO response = authService.register(user);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
