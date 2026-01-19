const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createAgreement, 
  getMyAgreements, 
  signAgreement 
} = require('../controllers/agreementController');

// 1. Create a new agreement
router.post('/', protect, createAgreement);

// 2. Get my agreements
router.get('/my', protect, getMyAgreements);

// 3. 🔥 SIGNATURE ROUTE (This was likely missing!)
// Matches frontend call: /api/agreements/sign/:id
router.put('/sign/:id', protect, signAgreement);

module.exports = router;