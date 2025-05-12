import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// Mock logger before anything else imports it
jest.mock('../utils/logger.js', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  };
  return { default: mockLogger };
});

// Mock mongoose
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    on: jest.fn(),
    once: jest.fn()
  }
}));

// Mock JWT verification middleware
jest.mock('../middleware/authMiddleware.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { _id: 'testUserId', role: 'Admin' };
    next();
  }
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ _id: 'testUserId', role: 'Admin' }),
  sign: jest.fn().mockReturnValue('mocked.jwt.token')
}));

// Set longer timeout for all tests
jest.setTimeout(30000);