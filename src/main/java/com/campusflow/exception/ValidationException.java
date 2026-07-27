package com.campusflow.exception;

/**
 * Exception thrown when validation fails.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
public class ValidationException extends RuntimeException {

    private final String path;
    private final String errorCode;

    public ValidationException(String message) {
        super(message);
        this.path = null;
        this.errorCode = null;
    }

    public ValidationException(String message, String path) {
        super(message);
        this.path = path;
        this.errorCode = null;
    }

    public ValidationException(String message, String path, String errorCode) {
        super(message);
        this.path = path;
        this.errorCode = errorCode;
    }

    public String getPath() {
        return path;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
