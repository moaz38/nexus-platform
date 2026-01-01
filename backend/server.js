const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // ✅ New Import (Files ka rasta dikhane ke liye)

// Config sab se uper rakho
dotenv.config();

const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ FIX: "uploads" folder ko Public banao taake images browser mein khul sakein
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// *** DEBUGGING LOGS ***
console.log("------------------------------------------------");
console.log("Check 1 - Mongo URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");
console.log("Check 2 - JWT Secret:", process.env.JWT_SECRET ? "Loaded ✅" : "Missing ❌");
console.log("------------------------------------------------");

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully! 🚀'))
  .catch((err) => {
    console.error('Database Connection Failed:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', require('./routes/documentRoutes'));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running... Nexus Backend is Live!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`📂 Files are accessible at: http://localhost:${PORT}/uploads`);
});