const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Application = require('../models/Application');
const { createNotification } = require('../utils/notifications');
const { getSocketId } = require('../utils/socket');

// GET /api/chat/conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name email role company')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/chat/conversations/with/:userId
router.post('/conversations/with/:userId', protect, async (req, res) => {
  try {
    const otherId = req.params.userId;
    const myId = req.user._id;

    // Check if they have a connection via application
    const hasConnection = await Application.findOne({
      $or: [
        { candidate: myId, employer: otherId },
        { candidate: otherId, employer: myId },
      ],
    });
    if (!hasConnection) {
      return res.status(403).json({ message: 'You can only chat with connected users via job applications' });
    }

    // Find or create conversation
    let convo = await Conversation.findOne({
      participants: { $all: [myId, otherId], $size: 2 },
    }).populate('participants', 'name email role company');

    if (!convo) {
      convo = await Conversation.create({ participants: [myId, otherId] });
      convo = await Conversation.findById(convo._id).populate('participants', 'name email role company');
    }

    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    if (!convo.participants.map(p => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });
    // Mark messages as read
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/chat/conversations/:id/messages
router.post('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Message content required' });

    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    if (!convo.participants.map(p => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      content: content.trim(),
    });

    await message.populate('sender', 'name email');

    // Update conversation
    convo.lastMessage = message._id;
    convo.lastMessageAt = new Date();
    await convo.save();

    // Emit via socket
    req.io.to(`conv_${req.params.id}`).emit('new_message', message);

    // Notify the other participant
    const otherId = convo.participants.find(p => p.toString() !== req.user._id.toString());
    if (otherId) {
      const socketId = getSocketId(otherId.toString());
      if (!socketId) {
        await createNotification(req.io, {
          userId: otherId,
          type: 'message',
          title: 'New Message',
          body: `${req.user.name}: ${content.slice(0, 60)}`,
          link: `/chat`,
        });
      }
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
