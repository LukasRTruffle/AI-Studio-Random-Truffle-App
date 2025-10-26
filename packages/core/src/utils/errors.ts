import { ERROR_CODES } from './constants';

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: Record<string, unknown>) {
    super(ERROR_CODES.AUTH_INVALID_CREDENTIALS, message, 401, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: Record<string, unknown>) {
    super(ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS, message, 403, details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ERROR_CODES.VALIDATION_INVALID_VALUE, message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: Record<string, unknown>) {
    super(ERROR_CODES.NOT_FOUND, message, 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ERROR_CODES.DB_QUERY_ERROR, message, 500, details);
    this.name = 'DatabaseError';
  }
}

/**
 * Agent invocation error
 */
export class AgentError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ERROR_CODES.AGENT_INVOCATION_FAILED, message, 500, details);
    this.name = 'AgentError';
  }
}

/**
 * External API error
 */
export class ExternalApiError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ERROR_CODES.API_REQUEST_FAILED, message, 502, details);
    this.name = 'ExternalApiError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', details?: Record<string, unknown>) {
    super(ERROR_CODES.API_RATE_LIMIT, message, 429, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): {
  code: string;
  message: string;
  details?: Record<string, unknown>;
} {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: error.message,
    };
  }

  return {
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred',
  };
}

/**
 * Check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
