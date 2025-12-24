const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Withdrawn'],
    default: 'Pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  message: {
    type: String,
    required: true
  },
  livingSituation: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String
  }
});

module.exports = mongoose.model('Application', applicationSchema);

