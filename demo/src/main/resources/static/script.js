/**
 * DOCTOR APPOINTMENT MANAGEMENT SYSTEM — FRONTEND CONTROLLER
 * College Project Expo Demonstration
 * Full REST API Integration with Java Spring Boot & PostgreSQL
 */

// API Base Endpoints
const BASE_API = "http://localhost:8080/api";
const API_URL = `${BASE_API}/doctors`;
const APPOINTMENT_API_URL = `${BASE_API}/appointments`;
const REPORT_API_URL = `${BASE_API}/reports`;

// State Cache
let doctorsList = [];
let appointmentsList = [];
let currentFilter = {
    search: "",
    specialty: "",
    mode: ""
};
let activeStatusTab = "ALL";

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    // Set default date for booking form (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById("appointmentDate");
    if (dateInput) {
        dateInput.value = tomorrow.toISOString().split("T")[0];
        dateInput.min = new Date().toISOString().split("T")[0];
    }

    // Set today for reports date input
    const reportDateInput = document.getElementById("reportDateInput");
    if (reportDateInput) {
        reportDateInput.value = new Date().toISOString().split("T")[0];
    }

    // Initial data fetch
    await checkBackendConnection();
    await fetchDoctors();
    await fetchAppointments();
    await fetchReports();
}

// ==========================================================================
// BACKEND STATUS CHECK
// ==========================================================================
async function checkBackendConnection() {
    const statusEl = document.getElementById("backendStatus");
    try {
        const res = await fetch(`${API_URL}`, { method: "GET" });
        if (res.ok) {
            statusEl.textContent = "Online (Connected)";
            statusEl.style.color = "#16a34a";
        } else {
            statusEl.textContent = "HTTP " + res.status;
            statusEl.style.color = "#d97706";
        }
    } catch (err) {
        statusEl.textContent = "Demo Standalone Mode";
        statusEl.style.color = "#0284c7";
        console.warn("Backend not yet reached on port 8080. Running with demo cache fallback.", err);
    }
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById("doctorSearchInput");
    searchInput.addEventListener("input", (e) => {
        currentFilter.search = e.target.value.toLowerCase().trim();
        filterAndRenderDoctors();
    });

    // Clear search button
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        currentFilter.search = "";
        filterAndRenderDoctors();
    });

    // Specialty filter dropdown
    const specialtyFilter = document.getElementById("specialtyFilter");
    specialtyFilter.addEventListener("change", (e) => {
        currentFilter.specialty = e.target.value;
        filterAndRenderDoctors();
    });

    // Mode filter dropdown
    const modeFilter = document.getElementById("modeFilter");
    modeFilter.addEventListener("change", (e) => {
        currentFilter.mode = e.target.value;
        filterAndRenderDoctors();
    });

    // Doctor Dropdown in Booking Form -> auto sync mode and fee
    const doctorSelect = document.getElementById("doctorSelect");
    doctorSelect.addEventListener("change", (e) => {
        handleDoctorSelectChange(e.target.value);
    });

    // Consultation Mode change in Booking Form
    const appointmentMode = document.getElementById("appointmentMode");
    appointmentMode.addEventListener("change", () => {
        validateDoctorModeCompatibility();
    });

    // Booking Form Submit
    const appointmentForm = document.getElementById("appointmentForm");
    appointmentForm.addEventListener("submit", handleBookingSubmit);

    // Reset Booking Form
    document.getElementById("resetBookingBtn").addEventListener("click", () => {
        appointmentForm.reset();
        document.getElementById("feeDisplay").textContent = "₹0.00";
        document.getElementById("doctorHintText").textContent = "Please choose a doctor to view mode and fee";
    });

    // Appointment Status Tabs
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            tabBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeStatusTab = e.target.dataset.status;
            renderAppointments();
        });
    });

    // Refresh Reports Button
    const refreshReportsBtn = document.getElementById("refreshReportsBtn");
    if (refreshReportsBtn) {
        refreshReportsBtn.addEventListener("click", fetchReports);
    }
    const reportDateInput = document.getElementById("reportDateInput");
    if (reportDateInput) {
        reportDateInput.addEventListener("change", fetchReports);
    }

    // Doctor Modal Controls
    const openAddDoctorBtn = document.getElementById("openAddDoctorBtn");
    const addDoctorSectionBtn = document.getElementById("addDoctorSectionBtn");
    const doctorModal = document.getElementById("doctorModal");
    const closeDoctorModalBtn = document.getElementById("closeDoctorModalBtn");
    const cancelDoctorModalBtn = document.getElementById("cancelDoctorModalBtn");
    const doctorForm = document.getElementById("doctorForm");

    const openDoctorModal = (doctorToEdit = null) => {
        doctorForm.reset();
        const modalTitle = document.getElementById("doctorModalTitle");
        const docIdInput = document.getElementById("doctorIdInput");
        const clinicAddressGroup = document.getElementById("clinicAddressGroup");

        if (doctorToEdit) {
            modalTitle.textContent = "Edit Doctor";
            docIdInput.value = doctorToEdit.id;
            document.getElementById("docName").value = doctorToEdit.name;
            document.getElementById("docSpecialty").value = doctorToEdit.specialty;
            document.getElementById("docMode").value = doctorToEdit.mode;
            document.getElementById("docEmail").value = doctorToEdit.email;
            document.getElementById("docPhone").value = doctorToEdit.phone || "";
            document.getElementById("docFee").value = doctorToEdit.consultationFee || 500;
            document.getElementById("docAddress").value = doctorToEdit.clinicAddress || "";
        } else {
            modalTitle.textContent = "Add New Doctor";
            docIdInput.value = "";
            document.getElementById("docFee").value = 500;
        }

        doctorModal.classList.add("active");
    };

    openAddDoctorBtn.addEventListener("click", () => openDoctorModal());
    addDoctorSectionBtn.addEventListener("click", () => openDoctorModal());
    closeDoctorModalBtn.addEventListener("click", () => doctorModal.classList.remove("active"));
    cancelDoctorModalBtn.addEventListener("click", () => doctorModal.classList.remove("active"));

    // Toggle address field depending on mode in Doctor Form
    document.getElementById("docMode").addEventListener("change", (e) => {
        const clinicGroup = document.getElementById("clinicAddressGroup");
        if (e.target.value === "ONLINE") {
            clinicGroup.style.display = "none";
        } else {
            clinicGroup.style.display = "block";
        }
    });

    doctorForm.addEventListener("submit", handleDoctorFormSubmit);

    // Edit Appointment Modal Controls
    const editApptModal = document.getElementById("appointmentEditModal");
    document.getElementById("closeApptModalBtn").addEventListener("click", () => editApptModal.classList.remove("active"));
    document.getElementById("cancelApptModalBtn").addEventListener("click", () => editApptModal.classList.remove("active"));
    document.getElementById("appointmentEditForm").addEventListener("submit", handleAppointmentEditSubmit);

    // Close Confirmation Modal
    document.getElementById("closeConfirmationBtn").addEventListener("click", () => {
        document.getElementById("confirmationModal").classList.remove("active");
    });
}

// ==========================================================================
// DOCTORS CRUD & FILTERING
// ==========================================================================
async function fetchDoctors() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch doctors from API");
        doctorsList = await response.json();
    } catch (err) {
        console.warn("Using sample doctors fallback:", err.message);
        if (doctorsList.length === 0) {
            doctorsList = getFallbackDoctors();
        }
    }

    populateDoctorDropdown();
    filterAndRenderDoctors();
    updateDashboardStats();
}

function filterAndRenderDoctors() {
    const container = document.getElementById("doctorListContainer");
    
    let filtered = doctorsList.filter(doc => {
        const matchName = !currentFilter.search || doc.name.toLowerCase().includes(currentFilter.search);
        const matchSpecialty = !currentFilter.specialty || doc.specialty.toLowerCase() === currentFilter.specialty.toLowerCase();
        const matchMode = !currentFilter.mode || doc.mode === currentFilter.mode;
        return matchName && matchSpecialty && matchMode;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🔍 No doctors found matching the selected filters.</p>
                <button class="btn btn-secondary-outline btn-small" onclick="resetDoctorFilters()" style="margin-top: 10px;">
                    Reset Filters
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(doc => `
        <div class="doctor-card" data-id="${doc.id}">
            <div>
                <div class="doctor-card-header">
                    <div>
                        <h3 class="doc-name">${escapeHtml(doc.name)}</h3>
                        <div class="doc-specialty">${escapeHtml(doc.specialty)}</div>
                    </div>
                    <span class="mode-badge ${doc.mode.toLowerCase()}">
                        ${doc.mode === 'ONLINE' ? '💻 ONLINE' : '🏥 OFFLINE'}
                    </span>
                </div>

                <ul class="doc-info-list">
                    <li>
                        <span class="doc-info-icon">📧</span>
                        <span>${escapeHtml(doc.email)}</span>
                    </li>
                    <li>
                        <span class="doc-info-icon">📞</span>
                        <span>${escapeHtml(doc.phone || '+91 98400 00000')}</span>
                    </li>
                    <li>
                        <span class="doc-info-icon">🕒</span>
                        <span>${escapeHtml(doc.availability || 'Mon-Fri 09:00 - 17:00')}</span>
                    </li>
                    ${doc.mode === 'OFFLINE' && doc.clinicAddress ? `
                    <li>
                        <span class="doc-info-icon">📍</span>
                        <span style="font-size: 0.8rem; color: #475569;">${escapeHtml(doc.clinicAddress)}</span>
                    </li>` : ''}
                    ${doc.mode === 'ONLINE' ? `
                    <li>
                        <span class="doc-info-icon">🌐</span>
                        <span style="font-size: 0.8rem; color: #0284c7;">Direct Video Consultation</span>
                    </li>` : ''}
                </ul>

                <div class="doc-fee-badge">
                    <span>Consultation:</span> ₹${(doc.consultationFee || 500).toFixed(2)}
                </div>
            </div>

            <div class="doc-card-actions">
                <button class="btn btn-primary btn-small" onclick="selectDoctorForBooking(${doc.id})">
                    Book Slot
                </button>
                <div class="doc-admin-btns">
                    <button class="btn btn-secondary-outline btn-small" onclick="editDoctor(${doc.id})">Edit</button>
                    <button class="btn btn-danger-outline btn-small" onclick="deleteDoctor(${doc.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join("");
}

function resetDoctorFilters() {
    document.getElementById("doctorSearchInput").value = "";
    document.getElementById("specialtyFilter").value = "";
    document.getElementById("modeFilter").value = "";
    currentFilter = { search: "", specialty: "", mode: "" };
    filterAndRenderDoctors();
}

function populateDoctorDropdown() {
    const select = document.getElementById("doctorSelect");
    const currentVal = select.value;

    select.innerHTML = '<option value="">Select Doctor</option>' +
        doctorsList.map(doc => `
            <option value="${doc.id}" data-mode="${doc.mode}" data-fee="${doc.consultationFee || 500}">
                ${doc.name} - ${doc.specialty} (${doc.mode === 'ONLINE' ? '💻 Online' : '🏥 Offline'})
            </option>
        `).join("");

    if (currentVal && doctorsList.some(d => d.id == currentVal)) {
        select.value = currentVal;
    }
}

function handleDoctorSelectChange(doctorId) {
    const modeSelect = document.getElementById("appointmentMode");
    const feeDisplay = document.getElementById("feeDisplay");
    const hintText = document.getElementById("doctorHintText");
    const modeHintText = document.getElementById("modeHintText");

    if (!doctorId) {
        feeDisplay.textContent = "₹0.00";
        hintText.textContent = "Please choose a doctor to view mode and fee";
        return;
    }

    const doctor = doctorsList.find(d => d.id == doctorId);
    if (!doctor) return;

    feeDisplay.textContent = `₹${(doctor.consultationFee || 500).toFixed(2)}`;
    hintText.textContent = `${doctor.name} (${doctor.specialty}) • Available: ${doctor.availability || 'Daily'}`;

    // STRICT RULE: Automatically synchronize the appointment mode to the Doctor's exclusive mode
    modeSelect.value = doctor.mode;
    
    if (doctor.mode === "ONLINE") {
        modeHintText.textContent = "🔒 Strictly Online: Doctor is designated exclusively for Video Consultations.";
        modeHintText.style.color = "#0284c7";
    } else {
        modeHintText.textContent = `🔒 Strictly Offline: In-clinic visit at ${doctor.clinicAddress || 'Hospital Clinic'}.`;
        modeHintText.style.color = "#059669";
    }
}

function validateDoctorModeCompatibility() {
    const doctorSelect = document.getElementById("doctorSelect");
    const modeSelect = document.getElementById("appointmentMode");
    const doctorId = doctorSelect.value;

    if (!doctorId) return true;

    const doctor = doctorsList.find(d => d.id == doctorId);
    if (!doctor) return true;

    if (doctor.mode !== modeSelect.value) {
        showToast(`Strict Rule Violation: ${doctor.name} only conducts ${doctor.mode} appointments!`, "error");
        // Revert mode back to doctor's mode
        modeSelect.value = doctor.mode;
        return false;
    }
    return true;
}

function selectDoctorForBooking(doctorId) {
    const doctorSelect = document.getElementById("doctorSelect");
    doctorSelect.value = doctorId;
    handleDoctorSelectChange(doctorId);
    
    // Smooth scroll to booking section
    const bookingSection = document.getElementById("booking");
    bookingSection.scrollIntoView({ behavior: "smooth" });
}

// Add or Edit Doctor
async function handleDoctorFormSubmit(e) {
    e.preventDefault();
    const docId = document.getElementById("doctorIdInput").value;
    const name = document.getElementById("docName").value.trim();
    const specialty = document.getElementById("docSpecialty").value.trim();
    const mode = document.getElementById("docMode").value;
    const email = document.getElementById("docEmail").value.trim();
    const phone = document.getElementById("docPhone").value.trim();
    const fee = parseFloat(document.getElementById("docFee").value) || 500.0;
    const address = document.getElementById("docAddress").value.trim();

    const doctorData = {
        name,
        specialty,
        mode,
        email,
        phone,
        consultationFee: fee,
        clinicAddress: mode === 'OFFLINE' ? address : null,
        meetingPlatform: mode === 'ONLINE' ? "Secure Telehealth Portal" : null,
        availability: "Mon-Fri 09:00 - 17:00",
        active: true
    };

    try {
        let response;
        if (docId) {
            // PUT
            response = await fetch(`${API_URL}/${docId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(doctorData)
            });
        } else {
            // POST
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(doctorData)
            });
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to save doctor");
        }

        showToast(docId ? "Doctor updated successfully!" : "Doctor added successfully!", "success");
        document.getElementById("doctorModal").classList.remove("active");
        await fetchDoctors();
    } catch (err) {
        console.error(err);
        showToast(err.message || "Error saving doctor", "error");
        
        // Demo mode fallback local update
        if (docId) {
            const index = doctorsList.findIndex(d => d.id == docId);
            if (index !== -1) {
                doctorsList[index] = { ...doctorsList[index], ...doctorData };
            }
        } else {
            const newDoc = { id: Date.now(), ...doctorData };
            doctorsList.push(newDoc);
        }
        document.getElementById("doctorModal").classList.remove("active");
        populateDoctorDropdown();
        filterAndRenderDoctors();
        updateDashboardStats();
    }
}

function editDoctor(id) {
    const doc = doctorsList.find(d => d.id == id);
    if (!doc) return;
    
    // Trigger open modal with doc data
    const openAddDoctorBtn = document.getElementById("openAddDoctorBtn");
    // Populate form
    document.getElementById("doctorIdInput").value = doc.id;
    document.getElementById("docName").value = doc.name;
    document.getElementById("docSpecialty").value = doc.specialty;
    document.getElementById("docMode").value = doc.mode;
    document.getElementById("docEmail").value = doc.email;
    document.getElementById("docPhone").value = doc.phone || "";
    document.getElementById("docFee").value = doc.consultationFee || 500;
    document.getElementById("docAddress").value = doc.clinicAddress || "";
    document.getElementById("doctorModalTitle").textContent = "Edit Doctor";
    document.getElementById("doctorModal").classList.add("active");
}

async function deleteDoctor(id) {
    const doc = doctorsList.find(d => d.id == id);
    const docName = doc ? doc.name : "this doctor";
    
    if (!confirm(`Are you sure you want to delete ${docName}?`)) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok && response.status !== 204) {
            throw new Error("Failed to delete doctor from database");
        }

        showToast("Doctor deleted successfully!", "success");
        await fetchDoctors();
    } catch (err) {
        console.warn("Delete API failed, removing locally:", err.message);
        doctorsList = doctorsList.filter(d => d.id != id);
        showToast("Doctor deleted successfully!", "success");
        populateDoctorDropdown();
        filterAndRenderDoctors();
        updateDashboardStats();
    }
}

// ==========================================================================
// APPOINTMENTS CRUD & STATUS WORKFLOW
// ==========================================================================
async function fetchAppointments() {
    try {
        const response = await fetch(APPOINTMENT_API_URL);
        if (!response.ok) throw new Error("Failed to fetch appointments");
        appointmentsList = await response.json();
    } catch (err) {
        console.warn("Using sample appointments fallback:", err.message);
        if (appointmentsList.length === 0) {
            appointmentsList = getFallbackAppointments();
        }
    }

    renderAppointments();
    updateDashboardStats();
}

function renderAppointments() {
    const container = document.getElementById("appointmentListContainer");

    let filtered = appointmentsList;
    if (activeStatusTab !== "ALL") {
        filtered = appointmentsList.filter(a => a.status === activeStatusTab);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📋 No appointments found under "${activeStatusTab}" status.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(appt => `
        <div class="appointment-card" data-id="${appt.id}">
            <div>
                <div class="appt-card-header">
                    <div>
                        <h3 class="patient-name">${escapeHtml(appt.patientName)}</h3>
                        <span class="appt-id-badge">APT-${appt.id}</span>
                    </div>
                    <span class="mode-badge ${appt.mode ? appt.mode.toLowerCase() : 'online'}">
                        ${appt.mode === 'ONLINE' ? '💻 ONLINE' : '🏥 OFFLINE'}
                    </span>
                </div>

                <div class="appt-meta-info">
                    <div class="appt-row">
                        <span>👨‍⚕️</span>
                        <strong>${escapeHtml(appt.doctorName)}</strong>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">(${escapeHtml(appt.specialty || 'Specialist')})</span>
                    </div>
                    <div class="appt-row">
                        <span>📅</span>
                        <span>${escapeHtml(appt.appointmentDate)} at <strong>${escapeHtml(appt.appointmentTime)}</strong></span>
                    </div>
                    <div class="appt-row">
                        <span>💰</span>
                        <span>Fee: ₹${(appt.consultationFee || 500).toFixed(2)}</span>
                    </div>
                    ${appt.mode === 'ONLINE' && appt.meetingLink ? `
                    <div class="appt-row">
                        <span>🔗</span>
                        <a href="${appt.meetingLink}" target="_blank" style="color: var(--primary); font-size: 0.8rem; text-decoration: underline;">
                            Join Video Consultation
                        </a>
                    </div>` : ''}
                    ${appt.mode === 'OFFLINE' && appt.clinicAddress ? `
                    <div class="appt-row">
                        <span>📍</span>
                        <span style="font-size: 0.8rem; color: #475569;">${escapeHtml(appt.clinicAddress)}</span>
                    </div>` : ''}
                </div>

                <div class="appt-reason-box">
                    <strong>Reason:</strong> ${escapeHtml(appt.reason)}
                </div>

                <!-- Interactive Status Dropdown -->
                <div class="status-dropdown-wrapper">
                    <label>Status:</label>
                    <select class="status-select ${(appt.status || 'PENDING').toLowerCase()}" 
                            onchange="handleStatusChange(${appt.id}, this.value, this)">
                        <option value="PENDING" ${appt.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                        <option value="CONFIRMED" ${appt.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                        <option value="COMPLETED" ${appt.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                        <option value="CANCELLED" ${appt.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                        <option value="NO_SHOW" ${appt.status === 'NO_SHOW' ? 'selected' : ''}>No-Show</option>
                    </select>
                </div>
            </div>

            <div class="appt-actions">
                <button class="btn btn-secondary-outline btn-small" onclick="openEditAppointmentModal(${appt.id})">
                    Edit
                </button>
                <button class="btn btn-danger-outline btn-small" onclick="deleteAppointment(${appt.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join("");
}

// Handle Appointment Booking Submit
async function handleBookingSubmit(e) {
    e.preventDefault();

    const patientName = document.getElementById("patientName").value.trim();
    const patientEmail = document.getElementById("patientEmail").value.trim();
    const patientPhone = document.getElementById("patientPhone").value.trim();
    const doctorId = document.getElementById("doctorSelect").value;
    const mode = document.getElementById("appointmentMode").value;
    const appointmentDate = document.getElementById("appointmentDate").value;
    const appointmentTime = document.getElementById("appointmentTime").value;
    const reason = document.getElementById("appointmentReason").value.trim();

    if (!doctorId) {
        showToast("Please select a doctor", "error");
        return;
    }

    const doctor = doctorsList.find(d => d.id == doctorId);

    // STRICT BUSINESS RULE VALIDATION
    if (doctor && doctor.mode !== mode) {
        showToast(`Strict Rule Violation: ${doctor.name} is an ${doctor.mode} doctor and cannot be booked for ${mode} consultation!`, "error");
        return;
    }

    const bookingPayload = {
        patientName,
        patientEmail,
        patientPhone,
        doctorId: parseInt(doctorId, 10),
        doctorName: doctor ? doctor.name : "",
        mode,
        appointmentDate,
        appointmentTime,
        reason
    };

    try {
        const response = await fetch(APPOINTMENT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingPayload)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || `Booking failed (${response.status})`);
        }

        showToast("Appointment booked successfully!", "success");

        // Open Confirmation Modal with Mode Specific Information
        showConfirmationModal(data);

        // Reset form & refresh
        document.getElementById("appointmentForm").reset();
        document.getElementById("feeDisplay").textContent = "₹0.00";
        await fetchAppointments();
        await fetchReports();

    } catch (err) {
        console.error("Booking error:", err);
        showToast(err.message || "Unable to book appointment", "error");

        // Fallback local booking for offline demo
        if (doctor) {
            const fallbackAppt = {
                id: Date.now().toString().slice(-4),
                patientName,
                patientEmail,
                patientPhone,
                doctorId: doctor.id,
                doctorName: doctor.name,
                specialty: doctor.specialty,
                mode: doctor.mode,
                appointmentDate,
                appointmentTime,
                reason,
                status: "PENDING",
                consultationFee: doctor.consultationFee || 500,
                clinicAddress: doctor.clinicAddress,
                meetingLink: doctor.mode === 'ONLINE' ? `https://meet.telehealth.org/room/${Math.random().toString(36).substring(7)}` : null
            };
            appointmentsList.unshift(fallbackAppt);
            showConfirmationModal(fallbackAppt);
            document.getElementById("appointmentForm").reset();
            renderAppointments();
            updateDashboardStats();
        }
    }
}

// Mode Specific Confirmation Modal
function showConfirmationModal(appt) {
    document.getElementById("confApptId").textContent = `#APT-${appt.id}`;
    document.getElementById("confPatientName").textContent = appt.patientName;
    document.getElementById("confDoctorName").textContent = appt.doctorName;
    document.getElementById("confDateTime").textContent = `${appt.appointmentDate} at ${appt.appointmentTime}`;
    document.getElementById("confMode").textContent = appt.mode;
    document.getElementById("confFee").textContent = `₹${(appt.consultationFee || 500).toFixed(2)}`;

    const modeBox = document.getElementById("confModeSpecificBox");
    if (appt.mode === "ONLINE") {
        modeBox.className = "mode-specific-box";
        modeBox.innerHTML = `
            <strong>💻 Online Video Consultation Details:</strong><br>
            • Meeting Portal: <code>${appt.meetingLink || 'https://telehealth.mediconnect.org/room/apt-' + appt.id}</code><br>
            • Instructions: Please join the room 5 minutes prior to the scheduled slot with a functioning camera and microphone.
        `;
    } else {
        modeBox.className = "mode-specific-box offline-notice";
        modeBox.innerHTML = `
            <strong>🏥 In-Clinic Hospital Visit Details:</strong><br>
            • Clinic Location: <strong>${appt.clinicAddress || 'Cabin 104, Metro Hospital & Research Center, Chennai'}</strong><br>
            • Instructions: Please arrive 15 minutes before your scheduled appointment at the reception desk with your Appointment ID.
        `;
    }

    document.getElementById("confirmationModal").classList.add("active");
}

// Fast Status Update via PUT /api/appointments/{id}/status
async function handleStatusChange(apptId, newStatus, selectElement) {
    // Preserve remaining fields while updating status
    const appt = appointmentsList.find(a => a.id == apptId);
    if (!appt) return;

    try {
        const response = await fetch(`${APPOINTMENT_API_URL}/${apptId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            // Try standard PUT fallback
            const updatedFull = { ...appt, status: newStatus };
            const fallbackRes = await fetch(`${APPOINTMENT_API_URL}/${apptId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedFull)
            });

            if (!fallbackRes.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || "Failed to update appointment status");
            }
        }

        appt.status = newStatus;
        showToast("Appointment status updated successfully!", "success");

        // Update class for styling
        selectElement.className = `status-select ${newStatus.toLowerCase()}`;
        updateDashboardStats();
        await fetchReports();

    } catch (err) {
        console.error(err);
        showToast(err.message || "Status update failed", "error");
        // Revert select
        selectElement.value = appt.status;
    }
}

// Edit Appointment Modal
function openEditAppointmentModal(id) {
    const appt = appointmentsList.find(a => a.id == id);
    if (!appt) return;

    document.getElementById("editApptId").value = appt.id;
    document.getElementById("editPatientName").value = appt.patientName;
    document.getElementById("editDoctorName").value = `${appt.doctorName} (${appt.mode})`;
    document.getElementById("editApptDate").value = appt.appointmentDate;
    document.getElementById("editApptTime").value = appt.appointmentTime;
    document.getElementById("editApptReason").value = appt.reason;
    document.getElementById("editApptStatus").value = appt.status;

    document.getElementById("appointmentEditModal").classList.add("active");
}

async function handleAppointmentEditSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("editApptId").value;
    const patientName = document.getElementById("editPatientName").value.trim();
    const appointmentDate = document.getElementById("editApptDate").value;
    const appointmentTime = document.getElementById("editApptTime").value.trim();
    const reason = document.getElementById("editApptReason").value.trim();
    const status = document.getElementById("editApptStatus").value;

    const existing = appointmentsList.find(a => a.id == id);
    if (!existing) return;

    const payload = {
        ...existing,
        patientName,
        appointmentDate,
        appointmentTime,
        reason,
        status
    };

    try {
        const response = await fetch(`${APPOINTMENT_API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Failed to update appointment");
        }

        showToast("Appointment updated successfully!", "success");
        document.getElementById("appointmentEditModal").classList.remove("active");
        await fetchAppointments();
    } catch (err) {
        console.error(err);
        showToast("Appointment updated locally!", "info");
        Object.assign(existing, payload);
        document.getElementById("appointmentEditModal").classList.remove("active");
        renderAppointments();
        updateDashboardStats();
    }
}

async function deleteAppointment(id) {
    if (!confirm(`Are you sure you want to delete Appointment #APT-${id}?`)) return;

    try {
        const response = await fetch(`${APPOINTMENT_API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok && response.status !== 204) {
            throw new Error("Failed to delete appointment");
        }

        showToast("Appointment deleted successfully!", "success");
        await fetchAppointments();
        await fetchReports();
    } catch (err) {
        console.warn("Delete API failed, removing locally:", err.message);
        appointmentsList = appointmentsList.filter(a => a.id != id);
        showToast("Appointment deleted successfully!", "success");
        renderAppointments();
        updateDashboardStats();
    }
}

// ==========================================================================
// DASHBOARD STATS & REPORTS
// ==========================================================================
function updateDashboardStats() {
    // Doctors stats
    const totalDocs = doctorsList.length;
    const onlineDocs = doctorsList.filter(d => d.mode === "ONLINE").length;
    const offlineDocs = doctorsList.filter(d => d.mode === "OFFLINE").length;

    document.getElementById("totalDoctorsCount").textContent = totalDocs;
    document.getElementById("statOnlineDoctors").textContent = `${onlineDocs} Online`;
    document.getElementById("statOfflineDoctors").textContent = `${offlineDocs} Offline`;

    // Appointments stats
    const totalAppts = appointmentsList.length;
    const onlineAppts = appointmentsList.filter(a => a.mode === "ONLINE").length;
    const offlineAppts = appointmentsList.filter(a => a.mode === "OFFLINE").length;
    const pendingAppts = appointmentsList.filter(a => a.status === "PENDING").length;
    const confirmedAppts = appointmentsList.filter(a => a.status === "CONFIRMED").length;
    const completedAppts = appointmentsList.filter(a => a.status === "COMPLETED").length;

    // Today's appointments count
    const todayStr = new Date().toISOString().split("T")[0];
    const todayCount = appointmentsList.filter(a => a.appointmentDate === todayStr).length;

    // Total Revenue (excluding cancelled)
    const totalRevenue = appointmentsList
        .filter(a => a.status !== "CANCELLED")
        .reduce((sum, a) => sum + (a.consultationFee || 500), 0);

    document.getElementById("totalAppointmentsCount").textContent = totalAppts;
    document.getElementById("statOnlineAppointments").textContent = `${onlineAppts} Online`;
    document.getElementById("statOfflineAppointments").textContent = `${offlineAppts} In-Clinic`;
    document.getElementById("todayAppointmentsCount").textContent = todayCount || totalAppts;
    document.getElementById("statPendingCount").textContent = `${pendingAppts} Pending`;
    document.getElementById("statConfirmedCount").textContent = `${confirmedAppts} Confirmed`;
    document.getElementById("totalRevenueCount").textContent = `₹${totalRevenue.toLocaleString("en-IN")}`;
    document.getElementById("statCompletedCount").textContent = `${completedAppts} Completed`;

    // Update report boxes
    document.getElementById("summaryPending").textContent = pendingAppts;
    document.getElementById("summaryConfirmed").textContent = confirmedAppts;
    document.getElementById("summaryCompleted").textContent = completedAppts;
    document.getElementById("summaryCancelled").textContent = appointmentsList.filter(a => a.status === "CANCELLED").length;
    document.getElementById("summaryNoShow").textContent = appointmentsList.filter(a => a.status === "NO_SHOW").length;

    // Update Mode Comparison bars
    const totalModeAppts = onlineAppts + offlineAppts;
    const onlinePct = totalModeAppts > 0 ? Math.round((onlineAppts / totalModeAppts) * 100) : 50;
    const offlinePct = 100 - onlinePct;

    const onlineRev = appointmentsList
        .filter(a => a.mode === "ONLINE" && a.status !== "CANCELLED")
        .reduce((sum, a) => sum + (a.consultationFee || 500), 0);
    const offlineRev = appointmentsList
        .filter(a => a.mode === "OFFLINE" && a.status !== "CANCELLED")
        .reduce((sum, a) => sum + (a.consultationFee || 500), 0);

    document.getElementById("reportOnlinePercent").textContent = `${onlinePct}%`;
    document.getElementById("reportOnlineBar").style.width = `${onlinePct}%`;
    document.getElementById("reportOnlineMeta").textContent = `${onlineAppts} appointments • ₹${onlineRev.toLocaleString("en-IN")}`;

    document.getElementById("reportOfflinePercent").textContent = `${offlinePct}%`;
    document.getElementById("reportOfflineBar").style.width = `${offlinePct}%`;
    document.getElementById("reportOfflineMeta").textContent = `${offlineAppts} appointments • ₹${offlineRev.toLocaleString("en-IN")}`;
}

async function fetchReports() {
    const dateInput = document.getElementById("reportDateInput");
    const selectedDate = dateInput ? dateInput.value : "";
    const url = selectedDate ? `${REPORT_API_URL}/daily?date=${selectedDate}` : `${REPORT_API_URL}/daily`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            renderSpecialtyAnalytics(data.appointmentsBySpecialty);
        } else {
            renderSpecialtyAnalyticsFromCache();
        }
    } catch (err) {
        renderSpecialtyAnalyticsFromCache();
    }
}

function renderSpecialtyAnalytics(specialtyMap) {
    const container = document.getElementById("specialtyAnalyticsContainer");
    if (!container) return;

    if (!specialtyMap || Object.keys(specialtyMap).length === 0) {
        renderSpecialtyAnalyticsFromCache();
        return;
    }

    const total = Object.values(specialtyMap).reduce((a, b) => a + b, 0) || 1;
    container.innerHTML = Object.entries(specialtyMap).map(([spec, count]) => {
        const pct = Math.round((count / total) * 100);
        return `
            <div class="specialty-row">
                <div class="specialty-label-count">
                    <span>${spec}</span>
                    <strong>${count} (${pct}%)</strong>
                </div>
                <div class="progress-track">
                    <div class="progress-bar" style="width: ${pct}%; background: var(--primary);"></div>
                </div>
            </div>
        `;
    }).join("");
}

function renderSpecialtyAnalyticsFromCache() {
    const specialtyCounts = {};
    appointmentsList.forEach(a => {
        const s = a.specialty || "General Medicine";
        specialtyCounts[s] = (specialtyCounts[s] || 0) + 1;
    });
    renderSpecialtyAnalytics(specialtyCounts);
}

// ==========================================================================
// TOAST NOTIFICATIONS & UTILITIES
// ==========================================================
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================================================
// FALLBACK SAMPLE DATA FOR EXPO DEMO
// ==========================================================================
function getFallbackDoctors() {
    return [
        {
            id: 1,
            name: "Dr. Sarah Jenkins",
            specialty: "Cardiology",
            mode: "ONLINE",
            email: "sarah.jenkins@mediconnect.org",
            phone: "+91 98401 11223",
            consultationFee: 850.0,
            availability: "Mon-Fri 10:00 - 16:00"
        },
        {
            id: 2,
            name: "Dr. Vikram Malhotra",
            specialty: "Neurology",
            mode: "ONLINE",
            email: "vikram.malhotra@mediconnect.org",
            phone: "+91 98402 22334",
            consultationFee: 1100.0,
            availability: "Tue-Sat 14:00 - 19:00"
        },
        {
            id: 3,
            name: "Dr. Priya Sharma",
            specialty: "Dermatology",
            mode: "ONLINE",
            email: "priya.sharma@mediconnect.org",
            phone: "+91 98403 33445",
            consultationFee: 650.0,
            availability: "Mon-Wed 09:00 - 13:00"
        },
        {
            id: 4,
            name: "Dr. Rajesh Kumar",
            specialty: "General Medicine",
            mode: "ONLINE",
            email: "rajesh.kumar@mediconnect.org",
            phone: "+91 98404 44556",
            consultationFee: 500.0,
            availability: "Mon-Sat 16:00 - 20:00"
        },
        {
            id: 5,
            name: "Dr. Arun Kumar",
            specialty: "Cardiology",
            mode: "OFFLINE",
            email: "arun.kumar@metrohospital.org",
            phone: "+91 94441 55667",
            consultationFee: 900.0,
            clinicAddress: "Cabin 204, Apollo Heart Center, Greams Road, Chennai",
            availability: "Mon-Sat 09:00 - 14:00"
        },
        {
            id: 6,
            name: "Dr. Meera Nambiar",
            specialty: "Neurology",
            mode: "OFFLINE",
            email: "meera.nambiar@metrohospital.org",
            phone: "+91 94442 66778",
            consultationFee: 1250.0,
            clinicAddress: "Neuro OPD Block 3, City Specialty Hospital, Chennai",
            availability: "Mon-Fri 10:00 - 15:00"
        },
        {
            id: 7,
            name: "Dr. Ananya Roy",
            specialty: "Dermatology",
            mode: "OFFLINE",
            email: "ananya.roy@metrohospital.org",
            phone: "+91 94443 77889",
            consultationFee: 750.0,
            clinicAddress: "Skin & Laser Clinic, Suite 102, Fortis Malar, Chennai",
            availability: "Tue-Sat 11:00 - 17:00"
        },
        {
            id: 8,
            name: "Dr. David Wilson",
            specialty: "Orthopedics",
            mode: "OFFLINE",
            email: "david.wilson@metrohospital.org",
            phone: "+91 94444 88990",
            consultationFee: 800.0,
            clinicAddress: "Orthopedic Wing B, Global Health City, Chennai",
            availability: "Mon-Fri 08:30 - 13:30"
        },
        {
            id: 9,
            name: "Dr. Sunita Patel",
            specialty: "Pediatrics",
            mode: "OFFLINE",
            email: "sunita.patel@metrohospital.org",
            phone: "+91 94445 99001",
            consultationFee: 600.0,
            clinicAddress: "Child Care Center, Rainbow Children's Hospital, Chennai",
            availability: "Mon-Sat 09:30 - 16:30"
        }
    ];
}

function getFallbackAppointments() {
    const todayStr = new Date().toISOString().split("T")[0];
    return [
        {
            id: 101,
            patientName: "Ramesh Chandran",
            patientEmail: "ramesh.c@gmail.com",
            patientPhone: "+91 98410 23456",
            doctorId: 1,
            doctorName: "Dr. Sarah Jenkins",
            specialty: "Cardiology",
            mode: "ONLINE",
            appointmentDate: todayStr,
            appointmentTime: "10:00 AM",
            reason: "Follow-up on ECG report and mild chest tightness",
            status: "CONFIRMED",
            consultationFee: 850.0,
            meetingLink: "https://telehealth.mediconnect.org/room/cardio-live-891"
        },
        {
            id: 102,
            patientName: "Sneha Kulkarni",
            patientEmail: "sneha.k@outlook.com",
            patientPhone: "+91 98410 78901",
            doctorId: 3,
            doctorName: "Dr. Priya Sharma",
            specialty: "Dermatology",
            mode: "ONLINE",
            appointmentDate: todayStr,
            appointmentTime: "11:30 AM",
            reason: "Allergic skin rash consultation",
            status: "PENDING",
            consultationFee: 650.0,
            meetingLink: "https://telehealth.mediconnect.org/room/derma-care-432"
        },
        {
            id: 103,
            patientName: "Karthik Sundaram",
            patientEmail: "karthik.s@gmail.com",
            patientPhone: "+91 94440 12389",
            doctorId: 5,
            doctorName: "Dr. Arun Kumar",
            specialty: "Cardiology",
            mode: "OFFLINE",
            appointmentDate: todayStr,
            appointmentTime: "09:30 AM",
            reason: "Routine hypertension check-up and blood pressure monitoring",
            status: "COMPLETED",
            consultationFee: 900.0,
            clinicAddress: "Cabin 204, Apollo Heart Center, Greams Road, Chennai"
        },
        {
            id: 104,
            patientName: "Divya Balakrishnan",
            patientEmail: "divya.b@yahoo.com",
            patientPhone: "+91 94440 98765",
            doctorId: 6,
            doctorName: "Dr. Meera Nambiar",
            specialty: "Neurology",
            mode: "OFFLINE",
            appointmentDate: todayStr,
            appointmentTime: "02:00 PM",
            reason: "Chronic migraine and dizziness consultation",
            status: "CONFIRMED",
            consultationFee: 1250.0,
            clinicAddress: "Neuro OPD Block 3, City Specialty Hospital, Chennai"
        },
        {
            id: 105,
            patientName: "Manoj Varma",
            patientEmail: "manoj.v@gmail.com",
            patientPhone: "+91 97900 11223",
            doctorId: 8,
            doctorName: "Dr. David Wilson",
            specialty: "Orthopedics",
            mode: "OFFLINE",
            appointmentDate: todayStr,
            appointmentTime: "11:00 AM",
            reason: "Ankle sprain physiotherapy review",
            status: "CANCELLED",
            consultationFee: 800.0,
            clinicAddress: "Orthopedic Wing B, Global Health City, Chennai"
        }
    ];
}
