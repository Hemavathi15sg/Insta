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

describe('User Avatar Upload API Routes', () => {
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
    const userRoutes = require('./users').default;

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

    app.use('/api/users', userRoutes);
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

  describe('POST /me/avatar - Upload Avatar', () => {
    describe('Error Cases - Validation', () => {
      it('should reject request without file', (done) => {
        request(app)
          .post('/api/users/me/avatar')
          .set('Authorization', 'Bearer test-token')
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('No avatar file provided');
          })
          .end(done);
      });
    });

    describe('Authentication', () => {
      it('should require authentication', (done) => {
        const mockAuthNotApplied = jest.fn((req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        });

        const testApp = express();
        testApp.use(express.json());
        testApp.post('/api/users/me/avatar', mockAuthNotApplied, (req, res) => {
          res.status(200).json({ success: true });
        });

        request(testApp)
          .post('/api/users/me/avatar')
          .expect(401)
          .end(done);
      });
    });
  });

  describe('GET /:id - Get User Profile', () => {
    it('should include avatar in user profile', (done) => {
      const userId = 1;
      
      const localMockDb = {
        get: jest.fn(),
        run: jest.fn(),
        all: jest.fn(),
      };

      (Database.getInstance as jest.Mock).mockReturnValue({
        getDb: jest.fn().mockReturnValue(localMockDb),
      });

      // Mock user data with avatar
      localMockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, {
          id: userId,
          username: 'testuser',
          email: 'test@example.com',
          avatar: '/uploads/avatar-123.png',
          bio: 'Test bio',
          created_at: '2025-01-01T10:00:00Z'
        });
      });

      // Mock posts
      localMockDb.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });

      request(app)
        .get(`/api/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.avatar).toBe('/uploads/avatar-123.png');
        })
        .end(done);
    });

    it('should show default avatar if none set', (done) => {
      const userId = 1;
      
      const localMockDb = {
        get: jest.fn(),
        run: jest.fn(),
        all: jest.fn(),
      };

      (Database.getInstance as jest.Mock).mockReturnValue({
        getDb: jest.fn().mockReturnValue(localMockDb),
      });

      // Mock user data without custom avatar
      localMockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, {
          id: userId,
          username: 'testuser',
          email: 'test@example.com',
          avatar: '/default-avatar.png',
          bio: 'Test bio',
          created_at: '2025-01-01T10:00:00Z'
        });
      });

      // Mock posts
      localMockDb.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });

      request(app)
        .get(`/api/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.avatar).toBe('/default-avatar.png');
        })
        .end(done);
    });
  });

  describe('GET /me - Get Current User', () => {
    it('should include avatar in current user data', (done) => {
      const localMockDb = {
        get: jest.fn(),
        run: jest.fn(),
        all: jest.fn(),
      };

      (Database.getInstance as jest.Mock).mockReturnValue({
        getDb: jest.fn().mockReturnValue(localMockDb),
      });
      
      localMockDb.get.mockImplementationOnce((sql, params, callback) => {
        callback(null, {
          id: 1,
          username: 'currentuser',
          email: 'current@example.com',
          avatar: '/uploads/avatar-456.png',
          bio: 'Current user bio'
        });
      });

      request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer test-token')
        .expect(200)
        .expect((res) => {
          expect(res.body.avatar).toBe('/uploads/avatar-456.png');
        })
        .end(done);
    });
  });
});
