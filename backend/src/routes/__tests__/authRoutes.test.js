import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import User from '../../models/User.js';
import logger from '../../utils/logger.js';
import bcrypt from 'bcryptjs';

// Setup mocks
jest.spyOn(User, 'findOne').mockImplementation(() => Promise.resolve(null));

jest.spyOn(logger, 'info').mockImplementation(() => {});
jest.spyOn(logger, 'error').mockImplementation(() => {});
jest.spyOn(logger, 'warn').mockImplementation(() => {});

jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

import authRoutes from '../authRoutes.js';

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if username or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Username and password are required');
    });

    it('should return 401 if user is not found', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 401 if password does not match', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce({
        _id: 'userId',
        password: 'hashedPassword'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'existingUser',
          password: 'wrongPassword'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 200 on successful logout', async () => {
      const res = await request(app)
        .post('/api/auth/logout');
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('POST /api/auth/recover-password', () => {
    beforeEach(() => {
      jest.spyOn(User, 'findOne').mockReset();
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/recover-password')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email is required');
    });

    it('should return 404 if user is not found', async () => {
      const res = await request(app)
        .post('/api/auth/recover-password')
        .send({
          email: 'nonexistent@example.com'
        });
      
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });
});