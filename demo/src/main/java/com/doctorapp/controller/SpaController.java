package com.doctorapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the React SPA (MediConnect real website) from Spring Boot static/.
 * Forwards all frontend routes to index.html so React Router (BrowserRouter)
 * can handle /doctor/login, /book, /admin/*, etc. Backend API stays on /api/**.
 */
@Controller
public class SpaController {

    @GetMapping({
        "/",
        "/login",
        "/signup",
        "/doctors",
        "/book",
        "/appointments",
        "/dashboard",
        "/doctor/login",
        "/doctor/dashboard",
        "/doctor/schedule",
        "/patient/login",
        "/patient/dashboard",
        "/admin/login",
        "/admin/dashboard",
        "/admin/doctors",
        "/admin/bookings"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
