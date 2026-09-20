package com.doctorapp.service;

import com.doctorapp.dto.DailySummaryDTO;
import com.doctorapp.entity.AppointmentStatus;
import com.doctorapp.entity.ConsultationMode;
import com.doctorapp.repository.AppointmentRepository;
import com.doctorapp.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ReportService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    public DailySummaryDTO getDailySummary(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        DailySummaryDTO summary = new DailySummaryDTO();
        summary.setDate(date);

        summary.setTotalAppointments(appointmentRepository.count());
        summary.setOnlineAppointments(appointmentRepository.countByMode(ConsultationMode.ONLINE));
        summary.setOfflineAppointments(appointmentRepository.countByMode(ConsultationMode.OFFLINE));

        summary.setPendingAppointments(appointmentRepository.countByStatus(AppointmentStatus.PENDING));
        summary.setConfirmedAppointments(appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        summary.setCompletedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        summary.setCancelledAppointments(appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));
        summary.setNoShowAppointments(appointmentRepository.countByStatus(AppointmentStatus.NO_SHOW));

        Double totalRev = appointmentRepository.calculateTotalRevenue();
        summary.setTotalRevenue(totalRev != null ? totalRev : 0.0);

        Double onlineRev = appointmentRepository.calculateRevenueByMode(ConsultationMode.ONLINE);
        summary.setOnlineRevenue(onlineRev != null ? onlineRev : 0.0);

        Double offlineRev = appointmentRepository.calculateRevenueByMode(ConsultationMode.OFFLINE);
        summary.setOfflineRevenue(offlineRev != null ? offlineRev : 0.0);

        summary.setTotalDoctors(doctorRepository.count());
        summary.setOnlineDoctors(doctorRepository.countByMode(ConsultationMode.ONLINE));
        summary.setOfflineDoctors(doctorRepository.countByMode(ConsultationMode.OFFLINE));

        Map<String, Long> specialtyMap = new HashMap<>();
        List<Object[]> specialtyResults = appointmentRepository.countAppointmentsBySpecialty();
        for (Object[] res : specialtyResults) {
            String spec = (String) res[0];
            Long count = (Long) res[1];
            if (spec != null) {
                specialtyMap.put(spec, count);
            }
        }
        summary.setAppointmentsBySpecialty(specialtyMap);

        return summary;
    }

    public Map<String, Object> getRevenueAnalytics() {
        Map<String, Object> map = new HashMap<>();
        Double total = appointmentRepository.calculateTotalRevenue();
        Double online = appointmentRepository.calculateRevenueByMode(ConsultationMode.ONLINE);
        Double offline = appointmentRepository.calculateRevenueByMode(ConsultationMode.OFFLINE);

        map.put("totalRevenue", total != null ? total : 0.0);
        map.put("onlineRevenue", online != null ? online : 0.0);
        map.put("offlineRevenue", offline != null ? offline : 0.0);
        return map;
    }

    public Map<String, Long> getAppointmentsByMode() {
        Map<String, Long> map = new HashMap<>();
        map.put("ONLINE", appointmentRepository.countByMode(ConsultationMode.ONLINE));
        map.put("OFFLINE", appointmentRepository.countByMode(ConsultationMode.OFFLINE));
        return map;
    }

    public Map<String, Long> getAppointmentsBySpecialty() {
        Map<String, Long> specialtyMap = new HashMap<>();
        List<Object[]> specialtyResults = appointmentRepository.countAppointmentsBySpecialty();
        for (Object[] res : specialtyResults) {
            String spec = (String) res[0];
            Long count = (Long) res[1];
            if (spec != null) {
                specialtyMap.put(spec, count);
            }
        }
        return specialtyMap;
    }
}
