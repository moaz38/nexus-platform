const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// ******************************************************
// 🚨 IMPORTANT: YE ROUTES SAB SE UPAR HONE CHAHIYEN
// ******************************************************

// 1. GET UNREAD COUNT (Ye sab se pehlay aana chahiye!)
router.get('/unread/count', protect, async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiverId: req.user._id,
            isRead: false
        });
        res.json({ count });
    } catch (error) {
        console.error("Count Error:", error);
        res.status(500).json({ count: 0 });
    }
});

// 2. GET CONVERSATIONS (Ye bhi ID wale route se pehlay ho)
router.get('/conversations', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
        }).sort({ createdAt: -1 });

        const uniqueUsers = {};
        messages.forEach(msg => {
            const otherUserId = msg.senderId.toString() === req.user._id.toString() 
                ? msg.receiverId.toString() 
                : msg.senderId.toString();
            
            if (!uniqueUsers[otherUserId]) {
                uniqueUsers[otherUserId] = {
                    _id: otherUserId,
                    lastMessage: msg.content,
                    createdAt: msg.createdAt
                };
            }
        });

        const userIds = Object.keys(uniqueUsers);
        const users = await User.find({ _id: { $in: userIds } }).select('name avatarUrl');

        const conversations = users.map(u => ({
            _id: u._id,
            name: u.name,
            avatarUrl: u.avatarUrl,
            lastMessage: uniqueUsers[u._id.toString()].lastMessage,
            createdAt: uniqueUsers[u._id.toString()].createdAt
        })).sort((a, b) => b.createdAt - a.createdAt);

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 3. SEND MESSAGE
router.post('/send', protect, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        if (!content || !receiverId) return res.status(400).json({ message: "Content required" });

        const newMessage = await Message.create({
            senderId: req.user._id,
            receiverId,
            content
        });

        await Notification.create({
            userId: receiverId,
            type: 'message',
            content: `New message from ${req.user.name}`,
            senderId: req.user._id,
            isRead: false
        });

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Failed to send' });
    }
});

// ******************************************************
// 🚨 DANGER ZONE: YE ROUTE SAB SE NEECHAY HONA CHAHIYE
// Kyunke ':id' har cheez ko pakar leta hai (jaise 'unread' ko bhi ID samajh lega)
// ******************************************************

// 4. GET MESSAGES BY ID
router.get('/:id', protect, async (req, res) => {
    try {
        const myId = req.user._id;
        const otherId = req.params.id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: otherId },
                { senderId: otherId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        // Jab chat khule, to messages ko READ mark karo
        await Message.updateMany(
            { senderId: otherId, receiverId: myId, isRead: false },
            { isRead: true }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

module.exports = router;