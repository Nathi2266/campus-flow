package com.campusflow.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * JWT token provider for CampusFlow.
 *
 * <p>Generates and validates JWT tokens for authentication.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey key;

    private final long accessTokenExpirationMs;

    private final long refreshTokenExpirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret:campusflow-secret-key-2024-change-in-production}") String secret,
            @Value("${jwt.access-token-expiration:900}") long accessTokenExpirationMs,
            @Value("${jwt.refresh-token-expiration:604800}") long refreshTokenExpirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    public String generateAccessToken(Long userId, String email, String role, Long departmentId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenExpirationMs, ChronoUnit.MILLIS);

        return Jwts.builder()
            .setSubject(String.valueOf(userId))
            .claim("email", email)
            .claim("role", role)
            .claim("departmentId", departmentId)
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiry))
            .signWith(key)
            .compact();
    }

    public String generateRefreshToken(Long userId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(refreshTokenExpirationMs, ChronoUnit.MILLIS);

        return Jwts.builder()
            .setSubject(String.valueOf(userId))
            .claim("type", "refresh")
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiry))
            .signWith(key)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        return Long.parseLong(Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject());
    }

    public String getRoleFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .get("role", String.class);
    }

    public Long getDepartmentIdFromToken(String token) {
        String deptId = Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .get("departmentId", String.class);
        return deptId != null ? Long.parseLong(deptId) : null;
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }
}
