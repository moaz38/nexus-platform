const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  getInvestors, 
  getEntrepreneurs, 
  getUserById 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Protected Routes (Login Zaroori Hai)
router.get('/me', protect, getMe);
router.get('/investors', protect, getInvestors);        // Investors list
router.get('/entrepreneurs', protect, getEntrepreneurs); // Startups list
router.get('/:id', protect, getUserById);               // Single Profile (Note: Ye hamesha last mein rakhna)

module.exports = router;