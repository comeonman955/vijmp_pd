const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// PUT /api/users/me
router.put('/me', protect, async (req, res) => {
  try {
    const { name, bio, education, skills, portfolioLink, company } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (education !== undefined) updates.education = education;
    if (skills !== undefined) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    if (portfolioLink !== undefined) updates.portfolioLink = portfolioLink;
    if (company !== undefined) updates.company = company;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
