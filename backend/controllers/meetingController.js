const Meeting = require('../models/Meeting');

// @desc    Schedule a new meeting
// @route   POST /api/meetings
const scheduleMeeting = async (req, res) => {
  try {
    const { title, description, date, time, duration, receiverId } = req.body;

    // TODO: Conflict check (Agar us time par pehle se meeting ho to rokna) - Baad mein add karein ge

    const meeting = await Meeting.create({
      title,
      description,
      date,
      time,
      duration,
      senderId: req.user.id, // Logged in user (Middleware se milega)
      receiverId,
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my meetings (Sent & Received)
// @route   GET /api/meetings/my-meetings
const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .sort({ createdAt: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update meeting status (Accept/Reject)
// @route   PUT /api/meetings/:id
const updateMeetingStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Sirf wohi banda accept/reject kar sake jisko request aayi hai
    if (meeting.receiverId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    meeting.status = status;
    await meeting.save();

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { scheduleMeeting, getMyMeetings, updateMeetingStatus };