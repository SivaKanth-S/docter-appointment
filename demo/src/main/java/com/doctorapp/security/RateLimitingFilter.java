package com.doctorapp.security;

import com.doctorapp.exception.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    @Value("${app.rate-limit.requests-per-minute:60}")
    private int maxRequestsPerMinute;

    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static class RequestCounter {
        long timestamp;
        AtomicInteger count;

        RequestCounter(long timestamp) {
            this.timestamp = timestamp;
            this.count = new AtomicInteger(1);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Apply rate limiting specifically on auth, booking, and high-frequency endpoints
        if (path.startsWith("/api/auth/") || path.startsWith("/api/appointments")) {
            String clientIp = getClientIp(request);
            long currentTime = System.currentTimeMillis();

            RequestCounter counter = requestCounts.compute(clientIp, (key, existing) -> {
                if (existing == null || currentTime - existing.timestamp > 60000) {
                    return new RequestCounter(currentTime);
                } else {
                    existing.count.incrementAndGet();
                    return existing;
                }
            });

            if (counter.count.get() > maxRequestsPerMinute) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                ErrorResponse error = new ErrorResponse(
                        HttpStatus.TOO_MANY_REQUESTS.value(),
                        "Too Many Requests",
                        "Rate limit exceeded (" + maxRequestsPerMinute + " req/min). Please try again in a moment.",
                        path
                );

                objectMapper.findAndRegisterModules();
                response.getWriter().write(objectMapper.writeValueAsString(error));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
