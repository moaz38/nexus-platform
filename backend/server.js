const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config();

// ✅ Models Import
const User = require('./models/User'); 
const { protect } = require('./middleware/authMiddleware');

const app = express();

// ********************************************************
// 🔥 IMPORTANT FIX: Increased Payload Size to 50MB
// ********************************************************
// Pehle 10mb tha, ab 50mb kar diya taake "Saving..." par na atkay
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ CORS (Sab allow kar diya)
app.use(cors({ origin: '*' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch((err) => console.error('❌ Database Connection Failed:', err));

// ********************************************************
// 🔥 PREMIUM UPGRADE ROUTE
// ********************************************************
app.post('/api/activate-premium', protect, async (req, res) => {
    console.log("🚀 PREMIUM UPGRADE HIT for:", req.user._id);
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { isPremium: true },
            { new: true } 
        );

        if (updatedUser) {
            console.log("✅ SUCCESS: User is now Premium!");
            return res.status(200).json({ success: true, isPremium: true });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("❌ ERROR:", error);
        return res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Routes Definition
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/agreements', require('./routes/agreementRoutes')); // ✅ Agreement Route
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes')); 
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ✅ Port 5001
const PORT = 5001;

app.listen(PORT, () => {
    console.log(`✅ SERVER RUNNING on Port ${PORT}`);
});