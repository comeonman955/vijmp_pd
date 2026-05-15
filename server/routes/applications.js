const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { createNotification } = require('../utils/notifications');

// POST /api/applications/:jobId
router.post('/:jobId', protect, requireRole('candidate'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (!job.isActive) return res.status(400).json({ message: 'This job is no longer active' });

    const exists = await Application.findOne({ job: job._id, candidate: req.user._id });
    if (exists) return res.status(409).json({ message: 'You have already applied to this job' });

    const application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      employer: job.employer,
      coverLetter: req.body.coverLetter || '',
    });

    await application.populate([
      { path: 'job', select: 'title company' },
      { path: 'candidate', select: 'name email' },
      { path: 'employer', select: 'name email' },
    ]);

    // Notify employer
    await createNotification(req.io, {
      userId: job.employer,
      type: 'application',
      title: 'New Application',
      body: `${req.user.name} applied to "${job.title}"`,
      link: '/applications',
    });

    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'You have already applied to this job' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/applications — list based on role
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'candidate'
      ? { candidate: req.user._id }
      : { employer: req.user._id };

    const applications = await Application.find(filter)
      .populate('job', 'title company location type')
      .populate('candidate', 'name email skills bio')
      .populate('employer', 'name company')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/applications/:id/status
router.patch('/:id/status', protect, requireRole('employer'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['submitted', 'reviewing', 'interview', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findOne({ _id: req.params.id, employer: req.user._id });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = status;
    await application.save();

    await application.populate([
      { path: 'job', select: 'title company' },
      { path: 'candidate', select: 'name email' },
    ]);

    // Notify candidate
    await createNotification(req.io, {
      userId: application.candidate._id,
      type: 'status',
      title: 'Application Status Updated',
      body: `Your application for "${application.job.title}" is now: ${status}`,
      link: '/applications',
    });

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/applications/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company location type description')
      .populate('candidate', 'name email skills bio education portfolioLink')
      .populate('employer', 'name company email');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const isOwner =
      application.candidate._id.toString() === req.user._id.toString() ||
      application.employer._id.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: 'Access denied' });

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
