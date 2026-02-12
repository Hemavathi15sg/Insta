import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';
import postRoutes from '../posts';
import authRoutes from '../auth';
import { Database } from '../../database';

// Create a test express app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  return app;
};

describe('Posts API - Tag Validation', () => {
  let app: express.Application;
  let authToken: string;
  let testUserId: number;
  let testPostId: number;

  beforeAll(async () => {
    app = createTestApp();
    
    // Create a test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!'
      });

    authToken = registerResponse.body.token;
    testUserId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test posts
    const db = Database.getInstance().getDb();
    if (testPostId) {
      db.run('DELETE FROM posts WHERE id = ?', [testPostId]);
    }
    if (testUserId) {
      db.run('DELETE FROM users WHERE id = ?', [testUserId]);
    }
  });

  describe('POST /api/posts - Create post with tag', () => {
    it('should accept a valid tag (under 20 characters)', async () => {
      const testImagePath = path.join(__dirname, '../../../test-assets/test-image.jpg');
      
      // Create a simple test image if it doesn't exist
      const testAssetsDir = path.join(__dirname, '../../../test-assets');
      if (!fs.existsSync(testAssetsDir)) {
        fs.mkdirSync(testAssetsDir, { recursive: true });
      }
      if (!fs.existsSync(testImagePath)) {
        // Create a minimal valid JPEG
        const buffer = Buffer.from([
          0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
          0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
          0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
        ]);
        fs.writeFileSync(testImagePath, buffer);
      }

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('caption', 'Test post with valid tag')
        .field('tag', 'nature')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.tag).toBe('nature');
      expect(response.body.caption).toBe('Test post with valid tag');
      
      testPostId = response.body.id;
    });

    it('should accept a post without a tag (tag is optional)', async () => {
      const testImagePath = path.join(__dirname, '../../../test-assets/test-image.jpg');

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('caption', 'Test post without tag')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.tag).toBeNull();
    });

    it('should truncate tags longer than 20 characters', async () => {
      const testImagePath = path.join(__dirname, '../../../test-assets/test-image.jpg');
      const longTag = 'this_is_a_very_long_tag_that_exceeds_twenty_characters';

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('caption', 'Test post with long tag')
        .field('tag', longTag)
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.tag).toBe('this_is_a_very_long_');
      expect(response.body.tag.length).toBe(20);
    });

    it('should return null for empty tag', async () => {
      const testImagePath = path.join(__dirname, '../../../test-assets/test-image.jpg');

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('caption', 'Test post with empty tag')
        .field('tag', '')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.tag).toBeNull();
    });

    it('should return null for whitespace-only tag', async () => {
      const testImagePath = path.join(__dirname, '../../../test-assets/test-image.jpg');

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('caption', 'Test post with whitespace tag')
        .field('tag', '   ')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.tag).toBeNull();
    });

    it('should trim whitespace from valid tags', async () => {
      const testImagePath = path.join(__dirname, '../../../test-assets/test-image.jpg');

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('caption', 'Test post with padded tag')
        .field('tag', '  sunset  ')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.tag).toBe('sunset');
    });
  });

  describe('PUT /api/posts/:id - Update post with tag', () => {
    let updatePostId: number;

    beforeEach(async () => {
      // Create a post for updating
      const testImagePath = path.join(__dirname, '../../../test-assets/test-image.jpg');
      
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('caption', 'Post to update')
        .field('tag', 'original')
        .attach('image', testImagePath);

      updatePostId = response.body.id;
    });

    it('should accept a valid tag update', async () => {
      const response = await request(app)
        .put(`/api/posts/${updatePostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caption: 'Updated caption',
          tag: 'updated'
        });

      expect(response.status).toBe(200);
      expect(response.body.tag).toBe('updated');
      expect(response.body.caption).toBe('Updated caption');
    });

    it('should truncate tags longer than 20 characters on update', async () => {
      const longTag = 'extremely_long_tag_exceeding_max_length';

      const response = await request(app)
        .put(`/api/posts/${updatePostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caption: 'Updated with long tag',
          tag: longTag
        });

      expect(response.status).toBe(200);
      expect(response.body.tag).toBe('extremely_long_tag_e');
      expect(response.body.tag.length).toBe(20);
    });

    it('should allow removing tag by setting it to empty', async () => {
      const response = await request(app)
        .put(`/api/posts/${updatePostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caption: 'Caption without tag',
          tag: ''
        });

      expect(response.status).toBe(200);
      expect(response.body.tag).toBeNull();
    });

    it('should trim whitespace from tags on update', async () => {
      const response = await request(app)
        .put(`/api/posts/${updatePostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caption: 'Updated caption',
          tag: '  travel  '
        });

      expect(response.status).toBe(200);
      expect(response.body.tag).toBe('travel');
    });

    it('should handle null tag on update', async () => {
      const response = await request(app)
        .put(`/api/posts/${updatePostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caption: 'Updated caption',
          tag: null
        });

      expect(response.status).toBe(200);
      expect(response.body.tag).toBeNull();
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .put('/api/posts/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caption: 'Updated caption',
          tag: 'test'
        });

      expect(response.status).toBe(404);
    });
  });
});
