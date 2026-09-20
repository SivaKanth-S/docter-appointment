package com.doctorapp.repository;

import com.doctorapp.entity.ConsultationMode;
import com.doctorapp.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByDoctorId(Long doctorId);

    List<Slot> findByDoctorIdAndAvailableTrue(Long doctorId);

    List<Slot> findByDoctorIdAndDateAndAvailableTrue(Long doctorId, LocalDate date);

    List<Slot> findByModeAndAvailableTrue(ConsultationMode mode);
}
