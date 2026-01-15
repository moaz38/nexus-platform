const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); 
const User = require('../models/User');

// ******************************************************
// 🔥 1. UPDATE PROFILE
// ******************************************************
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
    try {
        const updateFields = {
            name: req.body.name,
            bio: req.body.bio,
            location: req.body.location,
            companyName: req.body.companyName,
            industry: req.body.industry,
            website: req.body.website
        };

        if (req.file) {
            // ✅ FIX: 'localhost' ki jagah '127.0.0.1' use kiya taake image foran show ho
            updateFields.avatarUrl = `http://127.0.0.1:5001/uploads/${req.file.filename}`;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true, runValidators: false }
        );

        if (updatedUser) {
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatarUrl: updatedUser.avatarUrl,
                bio: updatedUser.bio,
                location: updatedUser.location,
                companyName: updatedUser.companyName,
                website: updatedUser.website,
                token: req.headers.authorization.split(' ')[1]
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }

    } catch (error) {
        console.error("❌ PROFILE UPDATE ERROR:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});

// ******************************************************
// ✅ 2. GET ALL USERS
// ******************************************************
router.get('/', protect, async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};
        
        if (role) {
            query.role = role;
        }
        
        query._id = { $ne: req.user._id };

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        console.error("Fetch Users Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// ******************************************************
// ✅ 3. GET SINGLE USER
// ******************************************************
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Fetch Single User Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;