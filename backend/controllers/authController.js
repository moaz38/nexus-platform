const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Token Generate Function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // ✅ Plain password create karein (Model khud Hash karega)
    const user = await User.create({
      name,
      email: cleanEmail,
      password: password, 
      role: role.toLowerCase(),
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    // ✅ Model method use karein
    if (user && (await user.matchPassword(password))) {
      console.log(`🔒 Login Successful: ${user.email}`);

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        avatarUrl: user.avatarUrl, // Avatar bhi bhejein
        token: generateToken(user.id),
        message: "Login Successful."
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (Bio, Image, Password, Info)
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // ✅ Basic Info
      user.name = req.body.name || user.name;
      user.bio = req.body.bio || user.bio;
      user.location = req.body.location || user.location;
      
      // ✅ Professional Info (Jo settings page par hain)
      user.companyName = req.body.companyName || user.companyName;
      user.industry = req.body.industry || user.industry;
      user.website = req.body.website || user.website;

      // ✅ Profile Picture (Agar frontend bhej raha hai)
      if (req.body.avatarUrl) {
        user.avatarUrl = req.body.avatarUrl;
      }

      // ✅ Password Logic (Agar user ne change kiya ho)
      if (req.body.password) {
        user.password = req.body.password; // Plain text save karein, Model hash karega
      }

      const updatedUser = await user.save(); // 🔥 Pre-save hook trigger hoga

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        location: updatedUser.location,
        avatarUrl: updatedUser.avatarUrl,
        companyName: updatedUser.companyName,
        industry: updatedUser.industry,
        website: updatedUser.website,
        isPremium: updatedUser.isPremium,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};