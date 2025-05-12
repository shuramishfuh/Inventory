import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import User from '../../models/User.js';
import logger from '../../utils/logger.js';

// Setup mocks
jest.spyOn(User, 'find').mockImplementation(() => Promise.resolve([]));
jest.spyOn(User, 'findById').mockImplementation(() => Promise.resolve(null));
jest.spyOn(User, 'create').mockImplementation(() => Promise.resolve({}));
jest.spyOn(User, 'findOne').mockImplementation(() => Promise.resolve(null));

jest.spyOn(logger, 'info').mockImplementation(() => {});
jest.spyOn(logger, 'error').mockImplementation(() => {});
jest.spyOn(logger, 'warn').mockImplementation(() => {});

import userRoutes from '../userRoutes.js';

describe('User Routes', () => {
  let app;
  const mockToken = 'Bearer mocked.jwt.token';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return 200 and empty array when no users exist', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', mockToken);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 400 for invalid user ID format', async () => {
      const res = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', mockToken);
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid user ID format');
    });
  });

  describe('POST /api/users', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', mockToken)
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Missing required fields');
    });

    it('should validate user data', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', mockToken)
        .send({
          username: '',
          email: 'invalid-email',
          password: 'short',
          role: 'InvalidRole'
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('missingFields');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should return 400 for invalid user ID format', async () => {
      const res = await request(app)
        .put('/api/users/invalid-id')
        .set('Authorization', mockToken)
        .send({ username: 'newUsername' });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid user ID format');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should return 400 for invalid user ID format', async () => {
      const res = await request(app)
        .delete('/api/users/invalid-id')
        .set('Authorization', mockToken);
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid user ID format');
    });

    it('should not allow deleting the last admin user', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce({ _id: 'adminUserId', role: 'Admin' });

      const res = await request(app)
        .delete('/api/users/adminUserId')
        .set('Authorization', mockToken);
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot delete the last admin user');
    });
  });
});