package com.campusflow.exception;

/**
 * Exception thrown when a requested resource is not found.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
public class NotFoundException extends RuntimeException {

    private final String path;

    public NotFoundException(String message) {
        super(message);
        this.path = null;
    }

    public NotFoundException(String message, String path) {
        super(message);
        this.path = path;
    }

    public String getPath() {
        return path;
    }
}
