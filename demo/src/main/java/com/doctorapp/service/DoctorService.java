package com.doctorapp.service;

import com.doctorapp.dto.DoctorDTO;
import com.doctorapp.entity.ConsultationMode;
import com.doctorapp.entity.Doctor;
import com.doctorapp.exception.BusinessRuleException;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    public List<Doctor> getDoctorsByMode(ConsultationMode mode) {
        return doctorRepository.findByMode(mode);
    }

    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialtyIgnoreCase(specialty);
    }

    public List<Doctor> searchDoctors(String name, String specialty, ConsultationMode mode) {
        if (name != null && !name.trim().isEmpty()) {
            return doctorRepository.findByNameContainingIgnoreCase(name.trim());
        }
        if (specialty != null && !specialty.trim().isEmpty() && mode != null) {
            return doctorRepository.findByModeAndSpecialtyIgnoreCase(mode, specialty.trim());
        }
        if (specialty != null && !specialty.trim().isEmpty()) {
            return doctorRepository.findBySpecialtyIgnoreCase(specialty.trim());
        }
        if (mode != null) {
            return doctorRepository.findByMode(mode);
        }
        return doctorRepository.findAll();
    }

    public List<String> getAllSpecialties() {
        return doctorRepository.findDistinctSpecialties();
    }

    public Doctor createDoctor(DoctorDTO dto) {
        if (dto.getEmail() != null && doctorRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BusinessRuleException("A doctor with email " + dto.getEmail() + " already exists.");
        }

        Doctor doctor = new Doctor();
        doctor.setName(dto.getName());
        doctor.setSpecialty(dto.getSpecialty());
        doctor.setMode(dto.getMode());
        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getPhone());
        doctor.setConsultationFee(dto.getConsultationFee() != null ? dto.getConsultationFee() : 500.0);
        doctor.setAvailability(dto.getAvailability() != null ? dto.getAvailability() : "Mon-Fri 09:00 - 17:00");
        doctor.setActive(dto.getActive() != null ? dto.getActive() : true);
        doctor.setCreatedAt(LocalDateTime.now());

        if (dto.getMode() == ConsultationMode.OFFLINE) {
            doctor.setClinicAddress(dto.getClinicAddress() != null ? dto.getClinicAddress() : "Room 102, Metro Medicare Hospital");
            doctor.setMeetingPlatform(null);
        } else {
            doctor.setMeetingPlatform(dto.getMeetingPlatform() != null ? dto.getMeetingPlatform() : "Secure Online Consultation Portal");
            doctor.setClinicAddress(null);
        }

        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, DoctorDTO dto) {
        Doctor doctor = getDoctorById(id);

        if (dto.getName() != null) doctor.setName(dto.getName());
        if (dto.getSpecialty() != null) doctor.setSpecialty(dto.getSpecialty());
        if (dto.getEmail() != null) doctor.setEmail(dto.getEmail());
        if (dto.getPhone() != null) doctor.setPhone(dto.getPhone());
        if (dto.getConsultationFee() != null) doctor.setConsultationFee(dto.getConsultationFee());
        if (dto.getAvailability() != null) doctor.setAvailability(dto.getAvailability());
        if (dto.getActive() != null) doctor.setActive(dto.getActive());

        if (dto.getMode() != null) {
            doctor.setMode(dto.getMode());
            if (dto.getMode() == ConsultationMode.OFFLINE) {
                if (dto.getClinicAddress() != null) doctor.setClinicAddress(dto.getClinicAddress());
            } else {
                if (dto.getMeetingPlatform() != null) doctor.setMeetingPlatform(dto.getMeetingPlatform());
            }
        }

        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        doctorRepository.delete(doctor);
    }

    public long countTotalDoctors() {
        return doctorRepository.count();
    }

    public long countByMode(ConsultationMode mode) {
        return doctorRepository.countByMode(mode);
    }
}
