import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import Asset from '../../models/Asset.js';
import logger from '../../utils/logger.js';
import SystemLog from '../../models/SystemLog.js';

// Setup mocks
jest.mock('../../models/Asset.js', () => ({
  default: {
    find: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    countDocuments: jest.fn().mockResolvedValue(0)
  }
}));

jest.mock('../../middleware/assetAccessControl', () => ({
  default: (req, res, next) => next()
}));

// Import routes after mocks
import assetRoutes from '../assetRoutes.js';

describe('Asset Routes', () => {
  let app;
  const mockToken = 'Bearer mocked.jwt.token';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/assets', assetRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/assets', () => {
    it('should return 200 and empty array when no assets exist', async () => {
      const res = await request(app)
        .get('/api/assets')
        .set('Authorization', mockToken);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.assets)).toBe(true);
    });

    it('should accept pagination parameters', async () => {
      const res = await request(app)
        .get('/api/assets')
        .set('Authorization', mockToken)
        .query({ page: 1, limit: 10 });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('currentPage');
      expect(res.body).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/assets/:id', () => {
    it('should return 400 for invalid asset ID format', async () => {
      const res = await request(app)
        .get('/api/assets/invalid-id')
        .set('Authorization', mockToken);
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid asset ID format');
    });
  });

  describe('POST /api/assets', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/assets')
        .set('Authorization', mockToken)
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should validate asset data', async () => {
      const res = await request(app)
        .post('/api/assets')
        .set('Authorization', mockToken)
        .send({
          name: '',
          assetTag: '',
          category: '',
          status: ''
        });
      
      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('name');
      expect(res.body.errors).toHaveProperty('assetTag');
      expect(res.body.errors).toHaveProperty('category');
      expect(res.body.errors).toHaveProperty('status');
    });
  });

  describe('PUT /api/assets/:id', () => {
    it('should return 400 for invalid asset ID format', async () => {
      const res = await request(app)
        .put('/api/assets/invalid-id')
        .set('Authorization', mockToken)
        .send({ name: 'Updated Asset' });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid asset ID format');
    });
  });

  describe('DELETE /api/assets/:id', () => {
    it('should return 400 for invalid asset ID format', async () => {
      const res = await request(app)
        .delete('/api/assets/invalid-id')
        .set('Authorization', mockToken);
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid asset ID format');
    });
  });
});