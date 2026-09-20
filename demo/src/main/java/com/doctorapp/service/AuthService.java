package com.doctorapp.service;

import com.doctorapp.dto.AuthResponseDTO;
import com.doctorapp.dto.LoginRequestDTO;
import com.doctorapp.entity.User;
import com.doctorapp.exception.BusinessRuleException;
import com.doctorapp.repository.UserRepository;
import com.doctorapp.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        String identifier = loginRequest.getUsername().trim();

        Optional<User> userOpt = userRepository.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier);
        }

        if (userOpt.isEmpty()) {
            throw new BusinessRuleException("Invalid username or password.");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BusinessRuleException("Invalid username or password.");
        }

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole());
        return new AuthResponseDTO(token, user.getUsername(), user.getRole(), "Login successful");
    }

    public AuthResponseDTO register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new BusinessRuleException("Username is already taken: " + user.getUsername());
        }
        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            throw new BusinessRuleException("Email is already registered: " + user.getEmail());
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Doctor & Admin are sign-in only (like Admin) — public registration is PATIENT only
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("ROLE_PATIENT");
        } else if ("ROLE_DOCTOR".equals(user.getRole()) || "ROLE_ADMIN".equals(user.getRole())) {
            throw new BusinessRuleException("Registration is allowed only for PATIENT accounts. Doctors and Admins must use Sign In with pre-provisioned credentials.");
        }
        user.setEnabled(true);

        User saved = userRepository.save(user);
        String token = tokenProvider.generateToken(saved.getUsername(), saved.getRole());

        return new AuthResponseDTO(token, saved.getUsername(), saved.getRole(), "User registered successfully");
    }
}
