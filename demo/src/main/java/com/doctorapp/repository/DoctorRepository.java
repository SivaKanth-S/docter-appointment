package com.doctorapp.repository;

import com.doctorapp.entity.ConsultationMode;
import com.doctorapp.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByMode(ConsultationMode mode);

    List<Doctor> findBySpecialtyIgnoreCase(String specialty);

    List<Doctor> findByNameContainingIgnoreCase(String name);

    List<Doctor> findByModeAndSpecialtyIgnoreCase(ConsultationMode mode, String specialty);

    Optional<Doctor> findByEmail(String email);

    @Query("SELECT DISTINCT d.specialty FROM Doctor d ORDER BY d.specialty")
    List<String> findDistinctSpecialties();

    long countByMode(ConsultationMode mode);
}
