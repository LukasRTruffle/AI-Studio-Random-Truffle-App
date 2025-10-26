import { describe, it, expect } from 'vitest';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  AgentError,
  ExternalApiError,
  RateLimitError,
  formatErrorResponse,
  isAppError,
} from '../utils/errors';
import { ERROR_CODES } from '../utils/constants';

describe('error utilities', () => {
  describe('AppError', () => {
    it('should create error with code and message', () => {
      const error = new AppError('TEST_CODE', 'Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should accept custom status code', () => {
      const error = new AppError('TEST_CODE', 'Test message', 404);
      expect(error.statusCode).toBe(404);
    });

    it('should accept details', () => {
      const details = { field: 'email', reason: 'invalid' };
      const error = new AppError('TEST_CODE', 'Test message', 400, details);
      expect(error.details).toEqual(details);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with default message', () => {
      const error = new AuthenticationError();
      expect(error.code).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
      expect(error.message).toBe('Authentication failed');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token');
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with default message', () => {
      const error = new AuthorizationError();
      expect(error.code).toBe(ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS);
      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Field is required');
      expect(error.code).toBe(ERROR_CODES.VALIDATION_INVALID_VALUE);
      expect(error.message).toBe('Field is required');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with default message', () => {
      const error = new NotFoundError();
      expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('User not found');
      expect(error.message).toBe('User not found');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error', () => {
      const error = new DatabaseError('Connection failed');
      expect(error.code).toBe(ERROR_CODES.DB_QUERY_ERROR);
      expect(error.message).toBe('Connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });
  });

  describe('AgentError', () => {
    it('should create agent error', () => {
      const error = new AgentError('Agent timeout');
      expect(error.code).toBe(ERROR_CODES.AGENT_INVOCATION_FAILED);
      expect(error.message).toBe('Agent timeout');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AgentError');
    });
  });

  describe('ExternalApiError', () => {
    it('should create external API error', () => {
      const error = new ExternalApiError('API request failed');
      expect(error.code).toBe(ERROR_CODES.API_REQUEST_FAILED);
      expect(error.message).toBe('API request failed');
      expect(error.statusCode).toBe(502);
      expect(error.name).toBe('ExternalApiError');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with default message', () => {
      const error = new RateLimitError();
      expect(error.code).toBe(ERROR_CODES.API_RATE_LIMIT);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });
  });

  describe('formatErrorResponse', () => {
    it('should format AppError', () => {
      const error = new ValidationError('Invalid email', { field: 'email' });
      const response = formatErrorResponse(error);
      expect(response.code).toBe(ERROR_CODES.VALIDATION_INVALID_VALUE);
      expect(response.message).toBe('Invalid email');
      expect(response.details).toEqual({ field: 'email' });
    });

    it('should format generic Error', () => {
      const error = new Error('Something went wrong');
      const response = formatErrorResponse(error);
      expect(response.code).toBe(ERROR_CODES.INTERNAL_SERVER_ERROR);
      expect(response.message).toBe('Something went wrong');
      expect(response.details).toBeUndefined();
    });

    it('should format unknown error', () => {
      const error = 'string error';
      const response = formatErrorResponse(error);
      expect(response.code).toBe(ERROR_CODES.INTERNAL_SERVER_ERROR);
      expect(response.message).toBe('An unexpected error occurred');
      expect(response.details).toBeUndefined();
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      expect(isAppError(new AppError('TEST', 'test'))).toBe(true);
      expect(isAppError(new ValidationError('test'))).toBe(true);
      expect(isAppError(new NotFoundError())).toBe(true);
    });

    it('should return false for non-AppError instances', () => {
      expect(isAppError(new Error('test'))).toBe(false);
      expect(isAppError('error')).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
    });
  });
});
