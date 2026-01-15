const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// 1. GET ALL NOTIFICATIONS
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('senderId', 'name avatarUrl');
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 🔥 2. MARK ALL AS READ (NEW ROUTE - Isay upar rakho)
router.put('/mark-all-read', protect, async (req, res) => {
    try {
        // Sirf unko update karo jo abhi tak read nahi hui hain
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'All marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// 3. MARK SINGLE AS READ
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification) {
            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;