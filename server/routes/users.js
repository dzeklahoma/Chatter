import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Search users
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Find users whose name or email contains the search query
    // Exclude the current user from results
    const users = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    }).limit(10);
    
    res.json({ users });
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Get user profile
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Update user profile
router.put('/profile', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { name } = req.body;
    const updateData = {};
    
    if (name) {
      updateData.name = name;
    }
    
    if (req.file) {
      // In a real app, you would upload to cloud storage
      // For this example, we're just saving the file path
      updateData.avatar = `/uploads/${req.file.filename}`;
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Update user's encryption key
router.put('/keys', verifyToken, async (req, res) => {
  try {
    const { publicKey } = req.body;
    
    if (!publicKey) {
      return res.status(400).json({ error: 'Public key is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { publicKey },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Update encryption keys error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

export default router;