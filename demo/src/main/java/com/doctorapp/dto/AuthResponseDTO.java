package com.doctorapp.dto;

public class AuthResponseDTO {

    private String token;
    private String type = "Bearer";
    private String username;
    private String role;
    private String message;

    public AuthResponseDTO() {}

    public AuthResponseDTO(String token, String username, String role, String message) {
        this.token = token;
        this.type = "Bearer";
        this.username = username;
        this.role = role;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
