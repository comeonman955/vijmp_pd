const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const Job = require('../models/Job');

// GET /api/jobs — all active jobs (candidate) or employer's jobs
router.get('/', protect, async (req, res) => {
  try {
    const { search, type, location } = req.query;
    const filter = { isActive: true };

    if (req.user.role === 'employer') {
      filter.employer = req.user._id;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const jobs = await Job.find(filter)
      .populate('employer', 'name company email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/jobs/recommended — skill-based recommendations
router.get('/recommended', protect, requireRole('candidate'), async (req, res) => {
  try {
    const userSkills = req.user.skills || [];
    if (!userSkills.length) {
      const jobs = await Job.find({ isActive: true })
        .populate('employer', 'name company')
        .sort({ createdAt: -1 })
        .limit(10);
      return res.json(jobs);
    }
    const jobs = await Job.find({
      isActive: true,
      skills: { $in: userSkills.map(s => new RegExp(s, 'i')) },
    })
      .populate('employer', 'name company')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/jobs/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name company email bio');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs
router.post('/', protect, requireRole('employer'), async (req, res) => {
  try {
    const { title, description, requirements, location, type, skills, salary } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const job = await Job.create({
      title,
      description,
      requirements: requirements || '',
      location: location || 'Remote',
      type: type || 'internship',
      skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()).filter(Boolean),
      salary: salary || '',
      company: req.user.company || req.user.name,
      employer: req.user._id,
    });
    await job.populate('employer', 'name company email');
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/jobs/:id
router.put('/:id', protect, requireRole('employer'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    const { title, description, requirements, location, type, skills, salary, isActive } = req.body;
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (location !== undefined) job.location = location;
    if (type !== undefined) job.type = type;
    if (skills !== undefined) job.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    if (salary !== undefined) job.salary = salary;
    if (isActive !== undefined) job.isActive = isActive;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', protect, requireRole('employer'), async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
