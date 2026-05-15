const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: { type: String, default: '' },
  location: { type: String, default: 'Remote' },
  type: { type: String, enum: ['full-time', 'part-time', 'internship', 'contract'], default: 'internship' },
  skills: [{ type: String }],
  salary: { type: String, default: '' },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
