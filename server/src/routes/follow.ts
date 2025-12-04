import express from 'express';
import { Database } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/users/:id/follow
 * Follow a user
 * @requires JWT authentication
 * @param id - Target user ID
 */
router.post('/:id/follow', authenticate, (req: AuthRequest, res) => {
  const db = Database.getInstance().getDb();
  const targetUserId = parseInt(req.params.id, 10);
  const followerId = req.userId;

  // Validate target user ID
  if (isNaN(targetUserId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid user ID format' 
    });
  }

  // Prevent self-follow
  if (followerId === targetUserId) {
    return res.status(400).json({ 
      success: false,
      error: 'Cannot follow yourself' 
    });
  }

  // Check if target user exists
  db.get(
    'SELECT id FROM users WHERE id = ?',
    [targetUserId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          error: 'Database error' 
        });
      }

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // Check if already following
      db.get(
        'SELECT id FROM user_follows WHERE follower_id = ? AND following_id = ?',
        [followerId, targetUserId],
        (err, existingFollow) => {
          if (err) {
            return res.status(500).json({ 
              success: false,
              error: 'Database error' 
            });
          }

          if (existingFollow) {
            return res.status(400).json({ 
              success: false,
              error: 'Already following this user' 
            });
          }

          // Insert follow relationship
          db.run(
            'INSERT INTO user_follows (follower_id, following_id) VALUES (?, ?)',
            [followerId, targetUserId],
            function(err) {
              if (err) {
                return res.status(500).json({ 
                  success: false,
                  error: 'Failed to follow user' 
                });
              }

              // Get updated follower count
              db.get(
                'SELECT COUNT(*) as count FROM user_follows WHERE following_id = ?',
                [targetUserId],
                (err, result: any) => {
                  res.status(201).json({
                    success: true,
                    message: 'User followed successfully',
                    data: {
                      followId: this.lastID,
                      followerId,
                      followingId: targetUserId,
                      followingCount: result?.count || 0,
                      createdAt: new Date().toISOString()
                    }
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

/**
 * DELETE /api/users/:id/follow
 * Unfollow a user
 * @requires JWT authentication
 * @param id - Target user ID
 */
router.delete('/:id/follow', authenticate, (req: AuthRequest, res) => {
  const db = Database.getInstance().getDb();
  const targetUserId = parseInt(req.params.id, 10);
  const followerId = req.userId;

  // Validate target user ID
  if (isNaN(targetUserId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid user ID format' 
    });
  }

  // Check if currently following
  db.get(
    'SELECT id FROM user_follows WHERE follower_id = ? AND following_id = ?',
    [followerId, targetUserId],
    (err, follow) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          error: 'Database error' 
        });
      }

      if (!follow) {
        return res.status(400).json({ 
          success: false,
          error: 'Not following this user' 
        });
      }

      // Delete follow relationship
      db.run(
        'DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?',
        [followerId, targetUserId],
        (err) => {
          if (err) {
            return res.status(500).json({ 
              success: false,
              error: 'Failed to unfollow user' 
            });
          }

          // Get updated follower count
          db.get(
            'SELECT COUNT(*) as count FROM user_follows WHERE following_id = ?',
            [targetUserId],
            (err, result: any) => {
              res.status(200).json({
                success: true,
                message: 'User unfollowed successfully',
                data: {
                  followingId: targetUserId,
                  followingCount: result?.count || 0
                }
              });
            }
          );
        }
      );
    }
  );
});

/**
 * GET /api/users/:id/followers
 * Get list of users following a specific user
 * @param id - User ID
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 20, max: 100)
 */
router.get('/:id/followers', (req: AuthRequest, res) => {
  const db = Database.getInstance().getDb();
  const userId = parseInt(req.params.id, 10);
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
  const offset = (page - 1) * limit;

  // Validate user ID
  if (isNaN(userId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid user ID format' 
    });
  }

  // Check if user exists
  db.get(
    'SELECT id FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          error: 'Database error' 
        });
      }

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // Get total count of followers
      db.get(
        'SELECT COUNT(*) as total FROM user_follows WHERE following_id = ?',
        [userId],
        (err, countResult: any) => {
          if (err) {
            return res.status(500).json({ 
              success: false,
              error: 'Database error' 
            });
          }

          const total = countResult?.total || 0;

          // Get followers with pagination
          db.all(
            `SELECT 
              u.id,
              u.username,
              u.email,
              u.avatar,
              u.bio,
              uf.created_at as followedAt
            FROM users u
            INNER JOIN user_follows uf ON u.id = uf.follower_id
            WHERE uf.following_id = ?
            ORDER BY uf.created_at DESC
            LIMIT ? OFFSET ?`,
            [userId, limit, offset],
            (err, followers: any[]) => {
              if (err) {
                return res.status(500).json({ 
                  success: false,
                  error: 'Database error' 
                });
              }

              res.status(200).json({
                success: true,
                data: {
                  page,
                  limit,
                  total,
                  totalPages: Math.ceil(total / limit),
                  followers: followers || []
                }
              });
            }
          );
        }
      );
    }
  );
});

/**
 * GET /api/users/:id/following
 * Get list of users that a specific user is following
 * @param id - User ID
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 20, max: 100)
 */
router.get('/:id/following', (req: AuthRequest, res) => {
  const db = Database.getInstance().getDb();
  const userId = parseInt(req.params.id, 10);
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
  const offset = (page - 1) * limit;

  // Validate user ID
  if (isNaN(userId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid user ID format' 
    });
  }

  // Check if user exists
  db.get(
    'SELECT id FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          error: 'Database error' 
        });
      }

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // Get total count of following
      db.get(
        'SELECT COUNT(*) as total FROM user_follows WHERE follower_id = ?',
        [userId],
        (err, countResult: any) => {
          if (err) {
            return res.status(500).json({ 
              success: false,
              error: 'Database error' 
            });
          }

          const total = countResult?.total || 0;

          // Get following with pagination
          db.all(
            `SELECT 
              u.id,
              u.username,
              u.email,
              u.avatar,
              u.bio,
              uf.created_at as followingSince
            FROM users u
            INNER JOIN user_follows uf ON u.id = uf.following_id
            WHERE uf.follower_id = ?
            ORDER BY u.username ASC
            LIMIT ? OFFSET ?`,
            [userId, limit, offset],
            (err, following: any[]) => {
              if (err) {
                return res.status(500).json({ 
                  success: false,
                  error: 'Database error' 
                });
              }

              res.status(200).json({
                success: true,
                data: {
                  page,
                  limit,
                  total,
                  totalPages: Math.ceil(total / limit),
                  following: following || []
                }
              });
            }
          );
        }
      );
    }
  );
});

/**
 * GET /api/users/:id/following-status/:targetId
 * Check if user is following another user
 * @requires JWT authentication
 * @param id - Current user ID
 * @param targetId - Target user ID to check
 */
router.get('/:id/following-status/:targetId', authenticate, (req: AuthRequest, res) => {
  const db = Database.getInstance().getDb();
  const userId = parseInt(req.params.id, 10);
  const targetId = parseInt(req.params.targetId, 10);
  const currentUserId = req.userId;

  // Validate IDs
  if (isNaN(userId) || isNaN(targetId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid user ID format' 
    });
  }

  // Verify user is checking their own status
  if (userId !== currentUserId) {
    return res.status(403).json({ 
      success: false,
      error: 'You can only check your own follow status' 
    });
  }

  // Prevent self-check
  if (userId === targetId) {
    return res.status(400).json({ 
      success: false,
      error: 'Cannot check follow status with yourself' 
    });
  }

  // Check if user is following target
  db.get(
    'SELECT created_at FROM user_follows WHERE follower_id = ? AND following_id = ?',
    [userId, targetId],
    (err, follow: any) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          error: 'Database error' 
        });
      }

      res.status(200).json({
        success: true,
        data: {
          isFollowing: !!follow,
          followedAt: follow?.created_at || null,
          targetUserId: targetId,
          currentUserId: userId
        }
      });
    }
  );
});

export default router;
