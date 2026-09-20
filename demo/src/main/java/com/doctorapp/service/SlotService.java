package com.doctorapp.service;

import com.doctorapp.entity.ConsultationMode;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Slot;
import com.doctorapp.exception.BusinessRuleException;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.DoctorRepository;
import com.doctorapp.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class SlotService {

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    public List<Slot> getSlotsByDoctor(Long doctorId) {
        return slotRepository.findByDoctorIdAndAvailableTrue(doctorId);
    }

    public List<Slot> getSlotsByDoctorAndDate(Long doctorId, LocalDate date) {
        return slotRepository.findByDoctorIdAndDateAndAvailableTrue(doctorId, date);
    }

    public Slot createSlot(Slot slot) {
        Doctor doctor = doctorRepository.findById(slot.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + slot.getDoctorId()));

        // Enforce doctor mode on slot
        if (slot.getMode() != null && slot.getMode() != doctor.getMode()) {
            throw new BusinessRuleException(String.format(
                    "Doctor '%s' is an %s doctor. Cannot create %s slot.",
                    doctor.getName(), doctor.getMode(), slot.getMode()
            ));
        }

        slot.setMode(doctor.getMode());
        slot.setDoctorName(doctor.getName());
        slot.setAvailable(true);
        return slotRepository.save(slot);
    }

    public void markSlotUnavailable(Long slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + slotId));
        slot.setAvailable(false);
        slotRepository.save(slot);
    }

    public void deleteSlot(Long slotId) {
        slotRepository.deleteById(slotId);
    }
}
