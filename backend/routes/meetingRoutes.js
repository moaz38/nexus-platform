const express = require('express');
const router = express.Router();
const { scheduleMeeting, getMyMeetings, updateMeetingStatus } = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

// Meeting book karna (POST /api/meetings)
router.post('/', protect, scheduleMeeting);

// Apni meetings dekhna (GET /api/meetings/my-meetings)
router.get('/my-meetings', protect, getMyMeetings);

// Meeting accept/reject karna (PUT /api/meetings/:id)
router.put('/:id', protect, updateMeetingStatus);

module.exports = router;