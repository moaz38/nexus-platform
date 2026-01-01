const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  time: {
    type: String, // Format: HH:MM
    required: true,
  },
  duration: {
    type: Number, // In minutes (e.g., 30, 60)
    default: 30,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Jo meeting request bhej raha hai
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Jisko request bheji ja rahi hai
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  meetingLink: {
    type: String, // Video call link (Week 2 ke part 2 mein use hoga)
    default: "",
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);