const Notification = require('../models/Notification');
const { getSocketId } = require('./socket');

const createNotification = async (io, { userId, type, title, body, link = '' }) => {
  try {
    const notification = await Notification.create({ user: userId, type, title, body, link });
    const socketId = getSocketId(userId);
    if (socketId) {
      io.to(socketId).emit('notification', notification);
    }
    return notification;
  } catch (err) {
    console.error('Notification error:', err);
  }
};

module.exports = { createNotification };
