import express from 'express';
import multer from 'multer';
import path from 'path';
import { Database } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const db = Database.getInstance().getDb();

// Multer configuration for avatar uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `avatar-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Get user profile
router.get('/:id', (req, res) => {
  const userId = req.params.id;

  db.get(
    'SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's posts
      db.all(
        'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, posts) => {
          res.json({ ...user, posts: posts || [] });
        }
      );
    }
  );
});

// Get current user
router.get('/me', authenticate, (req: AuthRequest, res) => {
  db.get(
    'SELECT id, username, email, avatar, bio FROM users WHERE id = ?',
    [req.userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Upload/Update avatar
router.post('/me/avatar', authenticate, upload.single('avatar'), (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No avatar file provided' 
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    db.run(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarUrl, req.userId],
      function(err) {
        if (err) {
          return res.status(500).json({ 
            success: false,
            error: 'Failed to update avatar' 
          });
        }
        res.status(200).json({ 
          success: true,
          message: 'Avatar updated successfully',
          data: { avatar: avatarUrl }
        });
      }
    );
  } catch (error) {
    console.error('Error in avatar upload endpoint:', error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        error: `Upload error: ${error.message}`
      });
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
});

export default router;