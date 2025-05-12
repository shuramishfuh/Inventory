import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import Log from '../../models/Log.js';
import SystemLog from '../../models/SystemLog.js';
import logger from '../../utils/logger.js';

// Setup mocks
jest.spyOn(Log, 'find').mockImplementation(() => Promise.resolve([]));
jest.spyOn(Log, 'aggregate').mockImplementation(() => Promise.resolve([]));

jest.spyOn(SystemLog, 'find').mockImplementation(() => Promise.resolve([]));
jest.spyOn(SystemLog, 'aggregate').mockImplementation(() => Promise.resolve([]));

jest.spyOn(logger, 'info').mockImplementation(() => {});
jest.spyOn(logger, 'error').mockImplementation(() => {});
jest.spyOn(logger, 'warn').mockImplementation(() => {});

import logRoutes from '../logRoutes.js';

describe('Log Routes', () => {
  let app;
  const mockToken = 'Bearer mocked.jwt.token';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/logs', logRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/logs/activity', () => {
    it('should accept date range filters', async () => {
      const res = await request(app)
        .get('/api/logs/activity')
        .set('Authorization', mockToken)
        .query({
          startDate: '2025-01-01',
          endDate: '2025-12-31'
        });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      const res = await request(app)
        .get('/api/logs/activity')
        .set('Authorization', mockToken)
        .query({
          page: 1,
          limit: 10
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('logs');
      expect(res.body).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/logs/system', () => {
    it('should filter by log level', async () => {
      const res = await request(app)
        .get('/api/logs/system')
        .set('Authorization', mockToken)
        .query({ level: 'error' });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should accept service filter', async () => {
      const res = await request(app)
        .get('/api/logs/system')
        .set('Authorization', mockToken)
        .query({ service: 'auth-service' });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/logs/metrics', () => {
    it('should return performance metrics', async () => {
      const mockMetrics = {
        requestCounts: {},
        errorRates: {},
        avgResponseTimes: {}
      };
      
      jest.spyOn(SystemLog, 'aggregate').mockResolvedValueOnce([mockMetrics]);

      const res = await request(app)
        .get('/api/logs/metrics')
        .set('Authorization', mockToken);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('requestCounts');
      expect(res.body).toHaveProperty('errorRates');
      expect(res.body).toHaveProperty('avgResponseTimes');
    });
  });

  describe('GET /api/logs/export', () => {
    it('should handle CSV format export', async () => {
      const res = await request(app)
        .get('/api/logs/export')
        .set('Authorization', mockToken)
        .query({ format: 'csv' });
      
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should handle JSON format export', async () => {
      const res = await request(app)
        .get('/api/logs/export')
        .set('Authorization', mockToken)
        .query({ format: 'json' });
      
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
    });
  });
});