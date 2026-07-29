package com.campusflow.security;

import io.jsonwebtoken.Claims;
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

    private static final int MIN_SECRET_LENGTH = 32;

    private final SecretKey key;

    private final long accessTokenExpirationMs;

    private final long refreshTokenExpirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret:}") String secret,
            @Value("${jwt.allow-insecure-default:false}") boolean allowInsecureDefault,
            @Value("${jwt.access-token-expiration:900000}") long accessTokenExpirationMs,
            @Value("${jwt.refresh-token-expiration:604800000}") long refreshTokenExpirationMs) {
        String resolved = secret != null ? secret.trim() : "";
        if (resolved.isEmpty()) {
            if (!allowInsecureDefault) {
                throw new IllegalStateException(
                    "jwt.secret must be set (env JWT_SECRET). Refusing to start without a signing secret.");
            }
            resolved = "campusflow-dev-only-secret-key-min-32-chars!!";
            log.warn("Using insecure JWT default secret — set JWT_SECRET for any shared/prod environment");
        }
        if (resolved.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                "jwt.secret must be at least " + MIN_SECRET_LENGTH + " characters");
        }
        this.key = Keys.hmacShaKeyFor(resolved.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    public String generateAccessToken(Long userId, String email, String role, Long departmentId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenExpirationMs, ChronoUnit.MILLIS);

        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("email", email)
            .claim("role", role)
            .claim("departmentId", departmentId)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(key)
            .compact();
    }

    public String generateRefreshToken(Long userId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(refreshTokenExpirationMs, ChronoUnit.MILLIS);

        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("type", "refresh")
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(key)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    public String getRoleFromToken(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public Long getDepartmentIdFromToken(String token) {
        Object deptId = parseClaims(token).get("departmentId");
        if (deptId == null) {
            return null;
        }
        if (deptId instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(deptId.toString());
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(parseClaims(token).get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    public Instant getExpirationFromToken(String token) {
        return parseClaims(token).getExpiration().toInstant();
    }

    public long getRefreshTokenExpirationMs() {
        return refreshTokenExpirationMs;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
