const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Task = require('../models/Task');
const Application = require('../models/Application');
const { createNotification } = require('../utils/notifications');

// POST /api/tasks — employer creates task
router.post('/', protect, requireRole('employer'), async (req, res) => {
  try {
    const { title, description, dueDate, applicationId } = req.body;
    if (!title || !description || !applicationId) {
      return res.status(400).json({ message: 'Title, description and applicationId are required' });
    }

    const application = await Application.findOne({
      _id: applicationId,
      employer: req.user._id,
      status: 'accepted',
    });
    if (!application) {
      return res.status(404).json({ message: 'Accepted application not found or unauthorized' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      application: application._id,
      candidate: application.candidate,
      employer: req.user._id,
    });

    await task.populate([
      { path: 'candidate', select: 'name email' },
      { path: 'employer', select: 'name company' },
      { path: 'application', populate: { path: 'job', select: 'title' } },
    ]);

    await createNotification(req.io, {
      userId: application.candidate,
      type: 'task',
      title: 'New Task Assigned',
      body: `You have a new task: "${title}"`,
      link: '/tasks',
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'employer'
      ? { employer: req.user._id }
      : { candidate: req.user._id };

    const tasks = await Task.find(filter)
      .populate('candidate', 'name email')
      .populate('employer', 'name company')
      .populate({ path: 'application', populate: { path: 'job', select: 'title company' } })
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/tasks/:id/submit — candidate submits
router.post('/:id/submit', protect, requireRole('candidate'), upload.single('file'), async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, candidate: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status === 'submitted' || task.status === 'reviewed') {
      return res.status(400).json({ message: 'Task already submitted' });
    }

    task.status = 'submitted';
    task.submissionNote = req.body.note || '';
    if (req.file) {
      task.submissionFile = `/uploads/${req.file.filename}`;
    }
    await task.save();

    await task.populate([
      { path: 'candidate', select: 'name email' },
      { path: 'employer', select: 'name company' },
    ]);

    await createNotification(req.io, {
      userId: task.employer,
      type: 'task',
      title: 'Task Submitted',
      body: `${req.user.name} submitted task: "${task.title}"`,
      link: '/tasks',
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/tasks/:id/review — employer reviews
router.patch('/:id/review', protect, requireRole('employer'), async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, employer: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'submitted') {
      return res.status(400).json({ message: 'Task must be submitted before reviewing' });
    }

    task.status = 'reviewed';
    task.reviewNote = req.body.reviewNote || '';
    task.grade = req.body.grade || '';
    await task.save();

    await task.populate('candidate', 'name email');

    await createNotification(req.io, {
      userId: task.candidate,
      type: 'task',
      title: 'Task Reviewed',
      body: `Your task "${task.title}" has been reviewed. Grade: ${task.grade || 'N/A'}`,
      link: '/tasks',
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
