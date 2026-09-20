package com.doctorapp.repository;

import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.AppointmentStatus;
import com.doctorapp.entity.ConsultationMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByMode(ConsultationMode mode);

    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);

    long countByMode(ConsultationMode mode);

    long countByStatus(AppointmentStatus status);

    long countByAppointmentDate(LocalDate date);

    @Query("SELECT COALESCE(SUM(a.consultationFee), 0.0) FROM Appointment a WHERE a.status != 'CANCELLED'")
    Double calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(a.consultationFee), 0.0) FROM Appointment a WHERE a.mode = :mode AND a.status != 'CANCELLED'")
    Double calculateRevenueByMode(@Param("mode") ConsultationMode mode);

    @Query("SELECT a.specialty, COUNT(a) FROM Appointment a GROUP BY a.specialty")
    List<Object[]> countAppointmentsBySpecialty();

    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            Long doctorId, LocalDate appointmentDate, String appointmentTime, AppointmentStatus status
    );
}
