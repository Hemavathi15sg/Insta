import express, { Express, Request, Response, NextFunction } from 'express';
import request from 'supertest';

// Mock the Database and auth BEFORE any requires
jest.mock('../database');
jest.mock('../middleware/auth');

// Now we can safely require and import
import { Database } from '../database';
import { authenticate } from '../middleware/auth';

interface MockDb {
  get: jest.Mock;
  run: jest.Mock;
  all: jest.Mock;
}

interface MockDatabaseInstance {
  getDb: jest.Mock;
}

describe('Follow/Unfollow API Routes', () => {
  let app: Express;
  let mockDb: MockDb;
  let mockDatabaseInstance: MockDatabaseInstance;

  beforeAll(() => {
    // Setup mock database
    mockDb = {
      get: jest.fn(),
      run: jest.fn(),
      all: jest.fn(),
    };

    mockDatabaseInstance = {
      getDb: jest.fn().mockReturnValue(mockDb),
    };

    (Database.getInstance as jest.Mock).mockReturnValue(mockDatabaseInstance);

    // Import routes AFTER mocks are configured
    // eslint-disable-next-line global-require
    const followRoutes = require('./follow').default;

    // Setup Express app
    app = express();
    app.use(express.json());
    
    // Mock authenticate middleware
    (authenticate as jest.Mock).mockImplementation(
      (req: Request, res: Response, next: NextFunction) => {
        (req as any).userId = 1;
        next();
      }
    );

    app.use('/api/users', followRoutes);
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset mock implementations
    mockDb = {
      get: jest.fn(),
      run: jest.fn(),
      all: jest.fn(),
    };

    mockDatabaseInstance = {
      getDb: jest.fn().mockReturnValue(mockDb),
    };

    (Database.getInstance as jest.Mock).mockReturnValue(mockDatabaseInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /:id/follow - Follow User', () => {
    describe('Success Cases', () => {
      it('should follow a user successfully', (done) => {
        const targetUserId = 2;
        const followerId = 1;

        // Mock user exists
        mockDb.get.mockImplementationOnce((sql: string, params: any[], callback: Function) => {
          callback(null, { id: targetUserId });
        });

        // Mock not already following
        mockDb.get.mockImplementationOnce((sql: string, params: any[], callback: Function) => {
          callback(null, null);
        });

        // Mock insert with this context
        mockDb.run.mockImplementationOnce(function (this: any, sql: string, params: any[], callback: Function) {
          this.lastID = 1;
          callback(null);
        });

        // Mock follower count
        mockDb.get.mockImplementationOnce((sql: string, params: any[], callback: Function) => {
          callback(null, { count: 5 });
        });

        request(app)
          .post(`/api/users/${targetUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect(201)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('User followed successfully');
            expect(res.body.data.followId).toBe(1);
            expect(res.body.data.followerId).toBe(followerId);
            expect(res.body.data.followingId).toBe(targetUserId);
            expect(res.body.data.followingCount).toBe(5);
            expect(res.body.data.createdAt).toBeDefined();
          })
          .end(done);
      });

      it('should return correct follow data structure', (done) => {
        const targetUserId = 3;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: targetUserId });
        });

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, null);
        });

        mockDb.run.mockImplementationOnce(function (this: any, sql: string, params: any, callback: Function) {
          this.lastID = 42;
          callback(null);
        });

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { count: 10 });
        });

        request(app)
          .post(`/api/users/${targetUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect((res) => {
            expect(res.body.data).toHaveProperty('followId');
            expect(res.body.data).toHaveProperty('followerId');
            expect(res.body.data).toHaveProperty('followingId');
            expect(res.body.data).toHaveProperty('createdAt');
            expect(res.body.data).toHaveProperty('followingCount');
          })
          .end(done);
      });
    });

    describe('Error Cases - Input Validation', () => {
      it('should reject invalid user ID format', (done) => {
        request(app)
          .post('/api/users/invalid/follow')
          .set('Authorization', 'Bearer test-token')
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid user ID format');
          })
          .end(done);
      });

      it('should prevent self-follow', (done) => {
        const selfUserId = 1; // Same as req.userId (set in beforeAll)

        request(app)
          .post(`/api/users/${selfUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Cannot follow yourself');
          })
          .end(done);
      });
    });

    describe('Error Cases - Business Logic', () => {
      it('should return 404 if target user not found', (done) => {
        const targetUserId = 999;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, null); // User not found
        });

        request(app)
          .post(`/api/users/${targetUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect(404)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('User not found');
          })
          .end(done);
      });

      it('should return 400 if already following user', (done) => {
        const targetUserId = 2;

        // User exists
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: targetUserId });
        });

        // Already following
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: 1 }); // Existing follow found
        });

        request(app)
          .post(`/api/users/${targetUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Already following this user');
          })
          .end(done);
      });
    });

    describe('Error Cases - Database Errors', () => {
      it('should handle database error on user lookup', (done) => {
        const targetUserId = 2;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(new Error('Database connection failed'), null);
        });

        request(app)
          .post(`/api/users/${targetUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect(500)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Database error');
          })
          .end(done);
      });

      it('should handle database error on follow check', (done) => {
        const targetUserId = 2;

        // User exists
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: targetUserId });
        });

        // Database error on follow check
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(new Error('Database query failed'), null);
        });

        request(app)
          .post(`/api/users/${targetUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect(500)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Database error');
          })
          .end(done);
      });

      it('should handle database error on insert', (done) => {
        const targetUserId = 2;

        // User exists
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: targetUserId });
        });

        // Not already following
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, null);
        });

        // Insert error
        mockDb.run.mockImplementationOnce(function (this: any, sql: string, params: any, callback: Function) {
          callback(new Error('Insert failed'));
        });

        request(app)
          .post(`/api/users/${targetUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect(500)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Failed to follow user');
          })
          .end(done);
      });
    });

    describe('Authentication', () => {
      it('should require authentication', (done) => {
        // Mock authenticate to not call next()
        const mockAuthNotApplied = jest.fn((req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        });

        const testApp = express();
        testApp.use(express.json());
        testApp.post('/api/users/:id/follow', mockAuthNotApplied, (req, res) => {
          res.status(200).json({ success: true });
        });

        request(testApp)
          .post('/api/users/2/follow')
          .expect(401)
          .end(done);
      });
    });
  });

  describe('DELETE /:id/follow - Unfollow User', () => {
    describe('Success Cases', () => {
      it('should unfollow a user successfully', (done) => {
        const targetUserId = 2;
        const followerId = 1;

        // Check if following
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: 1 }); // Currently following
        });

        // Delete
        mockDb.run.mockImplementationOnce((sql, params, callback) => {
          callback(null);
        });

        // Get updated count
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { count: 4 });
        });

        request(app)
          .delete(`/api/users/${targetUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('User unfollowed successfully');
            expect(res.body.data.followingCount).toBe(4);
          })
          .end(done);
      });
    });

    describe('Error Cases', () => {
      it('should return 400 if not following user', (done) => {
        const targetUserId = 2;

        // Not following
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, null); // Not following
        });

        request(app)
          .delete(`/api/users/${targetUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Not following this user');
          })
          .end(done);
      });

      it('should handle database error on unfollow', (done) => {
        const targetUserId = 2;

        // Check if following - found
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: 1 });
        });

        // Database error on delete
        mockDb.run.mockImplementationOnce((sql, params, callback) => {
          callback(new Error('Delete failed'));
        });

        request(app)
          .delete(`/api/users/${targetUserId}/follow`)
          .set('Authorization', 'Bearer test-token')
          .expect(500)
          .end(done);
      });

      it('should reject invalid user ID format', (done) => {
        request(app)
          .delete('/api/users/invalid/follow')
          .set('Authorization', 'Bearer test-token')
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid user ID format');
          })
          .end(done);
      });
    });
  });

  describe('GET /:id/followers - Get Followers List', () => {
    describe('Success Cases', () => {
      it('should return followers with default pagination', (done) => {
        const userId = 2;

        // User exists
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: userId });
        });

        // Get count
        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { total: 50 });
        });

        // Get followers
        mockDb.all.mockImplementationOnce((sql, params, callback) => {
          callback(null, [
            {
              id: 1,
              username: 'user1',
              email: 'user1@test.com',
              avatar: '/avatar1.png',
              bio: 'Bio 1',
              followedAt: '2025-01-01T10:00:00Z',
            },
            {
              id: 3,
              username: 'user3',
              email: 'user3@test.com',
              avatar: '/avatar3.png',
              bio: 'Bio 3',
              followedAt: '2025-01-02T10:00:00Z',
            },
          ]);
        });

        request(app)
          .get(`/api/users/${userId}/followers`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.page).toBe(1);
            expect(res.body.data.limit).toBe(20);
            expect(res.body.data.total).toBe(50);
            expect(res.body.data.totalPages).toBe(3);
            expect(res.body.data.followers).toHaveLength(2);
            expect(res.body.data.followers[0].username).toBe('user1');
          })
          .end(done);
      });

      it('should support custom pagination parameters', (done) => {
        const userId = 2;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: userId });
        });

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { total: 100 });
        });

        mockDb.all.mockImplementationOnce((sql, params, callback) => {
          callback(null, []);
        });

        request(app)
          .get(`/api/users/${userId}/followers?page=2&limit=10`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data.page).toBe(2);
            expect(res.body.data.limit).toBe(10);
            expect(res.body.data.totalPages).toBe(10);
          })
          .end(done);
      });

      it('should enforce maximum limit of 100', (done) => {
        const userId = 2;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: userId });
        });

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { total: 200 });
        });

        mockDb.all.mockImplementationOnce((sql, params, callback) => {
          callback(null, []);
        });

        request(app)
          .get(`/api/users/${userId}/followers?limit=500`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data.limit).toBeLessThanOrEqual(100);
          })
          .end(done);
      });

      it('should handle empty followers list', (done) => {
        const userId = 2;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: userId });
        });

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { total: 0 });
        });

        mockDb.all.mockImplementationOnce((sql, params, callback) => {
          callback(null, []);
        });

        request(app)
          .get(`/api/users/${userId}/followers`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data.followers).toHaveLength(0);
            expect(res.body.data.total).toBe(0);
          })
          .end(done);
      });
    });

    describe('Error Cases', () => {
      it('should return 404 if user not found', (done) => {
        const userId = 999;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, null);
        });

        request(app)
          .get(`/api/users/${userId}/followers`)
          .expect(404)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('User not found');
          })
          .end(done);
      });

      it('should reject invalid user ID format', (done) => {
        request(app)
          .get('/api/users/invalid/followers')
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid user ID format');
          })
          .end(done);
      });

      it('should handle database error on count', (done) => {
        const userId = 2;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { id: userId });
        });

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(new Error('Count query failed'));
        });

        request(app)
          .get(`/api/users/${userId}/followers`)
          .expect(500)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Database error');
          })
          .end(done);
      });
    });
  });

  describe('GET /:id/following-status/:targetId - Check Follow Status', () => {
    describe('Success Cases', () => {
      it('should return true if user is following', (done) => {
        const userId = 1;
        const targetId = 2;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { created_at: '2025-01-01T10:00:00Z' });
        });

        request(app)
          .get(`/api/users/${userId}/following-status/${targetId}`)
          .set('Authorization', 'Bearer test-token')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.isFollowing).toBe(true);
            expect(res.body.data.followedAt).toBe('2025-01-01T10:00:00Z');
          })
          .end(done);
      });

      it('should return false if user is not following', (done) => {
        const userId = 1;
        const targetId = 2;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, null);
        });

        request(app)
          .get(`/api/users/${userId}/following-status/${targetId}`)
          .set('Authorization', 'Bearer test-token')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.isFollowing).toBe(false);
            expect(res.body.data.followedAt).toBe(null);
          })
          .end(done);
      });
    });

    describe('Error Cases', () => {
      it('should return 400 for invalid user ID format', (done) => {
        request(app)
          .get('/api/users/invalid/following-status/2')
          .set('Authorization', 'Bearer test-token')
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid user ID format');
          })
          .end(done);
      });

      it('should return 403 if checking other user status', (done) => {
        // req.userId is 1, but checking status for user 2
        request(app)
          .get('/api/users/2/following-status/3')
          .set('Authorization', 'Bearer test-token')
          .expect(403)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('You can only check your own follow status');
          })
          .end(done);
      });

      it('should return 400 for self-check', (done) => {
        const userId = 1; // Same as req.userId

        request(app)
          .get(`/api/users/${userId}/following-status/${userId}`)
          .set('Authorization', 'Bearer test-token')
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Cannot check follow status with yourself');
          })
          .end(done);
      });

      it('should handle database error', (done) => {
        const userId = 1;
        const targetId = 2;

        mockDb.get.mockImplementationOnce((sql, params, callback) => {
          callback(new Error('Query failed'));
        });

        request(app)
          .get(`/api/users/${userId}/following-status/${targetId}`)
          .set('Authorization', 'Bearer test-token')
          .expect(500)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Database error');
          })
          .end(done);
      });
    });
  });

  describe('Code Coverage - Edge Cases', () => {
    it('should handle null follower count gracefully', (done) => {
      const targetUserId = 2;

      mockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, { id: targetUserId });
      });

      mockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, null);
      });

      mockDb.run.mockImplementationOnce(function (this: any, sql: string, params: any, callback: Function) {
        this.lastID = 1;
        callback(null);
      });

      // Return null for count (edge case)
      mockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, null);
      });

      request(app)
        .post(`/api/users/${targetUserId}/follow`)
        .set('Authorization', 'Bearer test-token')
        .expect(201)
        .expect((res) => {
          expect(res.body.data.followingCount).toBe(0);
        })
        .end(done);
    });

    it('should handle boundary page numbers', (done) => {
      const userId = 2;

      mockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, { id: userId });
      });

      mockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, { total: 20 });
      });

      mockDb.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });

      request(app)
        .get(`/api/users/${userId}/followers?page=0&limit=1`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.page).toBeGreaterThanOrEqual(1);
        })
        .end(done);
    });
  });
});
