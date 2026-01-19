const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // ✅ Hashing ke liye zaruri hai
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); 
const User = require('../models/User');

// ******************************************************
// 🔥 UPDATE PROFILE (Direct Hashing Logic Added)
// ******************************************************
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Normal Fields Update
            user.name = req.body.name || user.name;
            user.bio = req.body.bio || user.bio;
            user.location = req.body.location || user.location;
            user.companyName = req.body.companyName || user.companyName;
            user.industry = req.body.industry || user.industry;
            user.website = req.body.website || user.website;

            // ✅ Image Upload Logic
            if (req.file) {
                user.avatarUrl = `http://127.0.0.1:5001/uploads/${req.file.filename}`;
            }

            // ✅ Password Update (Manual Hashing to bypass Middleware error)
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            // ✅ Save User
            // Note: Agar pre-save hook abhi bhi error de, to User.js se usay comment kar dein
            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatarUrl: updatedUser.avatarUrl,
                bio: updatedUser.bio,
                location: updatedUser.location,
                companyName: updatedUser.companyName,
                industry: updatedUser.industry,
                website: updatedUser.website,
                isPremium: updatedUser.isPremium,
                token: req.headers.authorization.split(' ')[1] 
            });

        } else {
            res.status(404).json({ message: 'User not found' });
        }

    } catch (error) {
        console.error("❌ PROFILE UPDATE ERROR:", error.stack); // Full error details terminal mein check karein
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});

// GET ALL USERS & GET SINGLE USER waise hi rehne dein...
router.get('/', protect, async (req, res) => {
    try {
        const { role } = req.query;
        let query = { _id: { $ne: req.user._id } };
        if (role) query.role = role;
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        user ? res.json(user) : res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;