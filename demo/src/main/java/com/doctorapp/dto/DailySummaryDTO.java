package com.doctorapp.dto;

import java.time.LocalDate;
import java.util.Map;

public class DailySummaryDTO {

    private LocalDate date;
    private long totalAppointments;
    private long onlineAppointments;
    private long offlineAppointments;
    private long pendingAppointments;
    private long confirmedAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long noShowAppointments;
    private double totalRevenue;
    private double onlineRevenue;
    private double offlineRevenue;
    private long totalDoctors;
    private long onlineDoctors;
    private long offlineDoctors;
    private Map<String, Long> appointmentsBySpecialty;

    public DailySummaryDTO() {}

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public long getOnlineAppointments() {
        return onlineAppointments;
    }

    public void setOnlineAppointments(long onlineAppointments) {
        this.onlineAppointments = onlineAppointments;
    }

    public long getOfflineAppointments() {
        return offlineAppointments;
    }

    public void setOfflineAppointments(long offlineAppointments) {
        this.offlineAppointments = offlineAppointments;
    }

    public long getPendingAppointments() {
        return pendingAppointments;
    }

    public void setPendingAppointments(long pendingAppointments) {
        this.pendingAppointments = pendingAppointments;
    }

    public long getConfirmedAppointments() {
        return confirmedAppointments;
    }

    public void setConfirmedAppointments(long confirmedAppointments) {
        this.confirmedAppointments = confirmedAppointments;
    }

    public long getCompletedAppointments() {
        return completedAppointments;
    }

    public void setCompletedAppointments(long completedAppointments) {
        this.completedAppointments = completedAppointments;
    }

    public long getCancelledAppointments() {
        return cancelledAppointments;
    }

    public void setCancelledAppointments(long cancelledAppointments) {
        this.cancelledAppointments = cancelledAppointments;
    }

    public long getNoShowAppointments() {
        return noShowAppointments;
    }

    public void setNoShowAppointments(long noShowAppointments) {
        this.noShowAppointments = noShowAppointments;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getOnlineRevenue() {
        return onlineRevenue;
    }

    public void setOnlineRevenue(double onlineRevenue) {
        this.onlineRevenue = onlineRevenue;
    }

    public double getOfflineRevenue() {
        return offlineRevenue;
    }

    public void setOfflineRevenue(double offlineRevenue) {
        this.offlineRevenue = offlineRevenue;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getOnlineDoctors() {
        return onlineDoctors;
    }

    public void setOnlineDoctors(long onlineDoctors) {
        this.onlineDoctors = onlineDoctors;
    }

    public long getOfflineDoctors() {
        return offlineDoctors;
    }

    public void setOfflineDoctors(long offlineDoctors) {
        this.offlineDoctors = offlineDoctors;
    }

    public Map<String, Long> getAppointmentsBySpecialty() {
        return appointmentsBySpecialty;
    }

    public void setAppointmentsBySpecialty(Map<String, Long> appointmentsBySpecialty) {
        this.appointmentsBySpecialty = appointmentsBySpecialty;
    }
}
