// Mock the database before any imports
const mockDb = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn()
};

jest.mock('../../database', () => ({
  Database: {
    getInstance: jest.fn(() => ({
      getDb: () => mockDb
    }))
  }
}));

// Mock the authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.userId = 1; // Mock authenticated user ID
    next();
  },
  AuthRequest: {} // Type export
}));

// Mock the caption service
jest.mock('../../services/captionService', () => ({
  default: {
    generateCaptionsFromBuffer: jest.fn(),
    isAvailable: jest.fn(() => false),
    extractHashtags: jest.fn(() => [])
  }
}));

// Mock multer
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req: any, res: any, next: any) => next(),
    array: () => (req: any, res: any, next: any) => next()
  });
  multer.diskStorage = jest.fn();
  multer.memoryStorage = jest.fn();
  return multer;
});

import request from 'supertest';
import express from 'express';
import postsRouter from '../posts';

describe('Posts API - Caption Edit/Delete', () => {
  let app: express.Application;

  beforeEach(() => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/posts', postsRouter);
    
    // Clear mock calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /:id/caption', () => {
    it('should update caption when user owns the post', async () => {
      const mockPost = {
        id: 1,
        user_id: 1,
        image_url: '/uploads/test.jpg',
        caption: 'Old caption'
      };

      // Mock database responses
      mockDb.get.mockImplementation((query: string, params: any[], callback: Function) => {
        callback(null, mockPost);
      });

      mockDb.run.mockImplementation((query: string, params: any[], callback: Function) => {
        callback(null);
      });

      const response = await request(app)
        .put('/api/posts/1/caption')
        .send({ caption: 'New caption' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Caption updated successfully',
        caption: 'New caption'
      });
    });

    it('should return 404 when post not found', async () => {
      mockDb.get.mockImplementation((query: string, params: any[], callback: Function) => {
        callback(null, null);
      });

      const response = await request(app)
        .put('/api/posts/999/caption')
        .send({ caption: 'New caption' })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Post not found or unauthorized'
      });
    });

    it('should return 400 when caption is missing', async () => {
      const response = await request(app)
        .put('/api/posts/1/caption')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Caption is required'
      });
    });

    it('should allow empty string caption', async () => {
      const mockPost = {
        id: 1,
        user_id: 1,
        image_url: '/uploads/test.jpg',
        caption: 'Old caption'
      };

      mockDb.get.mockImplementation((query: string, params: any[], callback: Function) => {
        callback(null, mockPost);
      });

      mockDb.run.mockImplementation((query: string, params: any[], callback: Function) => {
        callback(null);
      });

      const response = await request(app)
        .put('/api/posts/1/caption')
        .send({ caption: '' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Caption updated successfully',
        caption: ''
      });
    });

    it('should return 500 on database error', async () => {
      mockDb.get.mockImplementation((query: string, params: any[], callback: Function) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .put('/api/posts/1/caption')
        .send({ caption: 'New caption' })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('DELETE /:id/caption', () => {
    it('should delete caption when user owns the post', async () => {
      const mockPost = {
        id: 1,
        user_id: 1,
        image_url: '/uploads/test.jpg',
        caption: 'Caption to delete'
      };

      mockDb.get.mockImplementation((query: string, params: any[], callback: Function) => {
        callback(null, mockPost);
      });

      mockDb.run.mockImplementation((query: string, params: any[], callback: Function) => {
        callback(null);
      });

      const response = await request(app)
        .delete('/api/posts/1/caption')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Caption deleted successfully'
      });
    });

    it('should return 404 when post not found', async () => {
      mockDb.get.mockImplementation((query: string, params: any[], callback: Function) => {
        callback(null, null);
      });

      const response = await request(app)
        .delete('/api/posts/999/caption')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Post not found or unauthorized'
      });
    });

    it('should return 500 on database error', async () => {
      mockDb.get.mockImplementation((query: string, params: any[], callback: Function) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .delete('/api/posts/1/caption')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Server error'
      });
    });
  });
});
