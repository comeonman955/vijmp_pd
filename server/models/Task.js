const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['assigned', 'submitted', 'reviewed'],
    default: 'assigned',
  },
  submissionFile: { type: String, default: '' },
  submissionNote: { type: String, default: '' },
  reviewNote: { type: String, default: '' },
  grade: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
