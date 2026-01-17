const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    createAgreement, 
    signAgreement, 
    getMyAgreements 
} = require('../controllers/agreementController');

// GET /api/agreements -> User ke apne saare agreements
router.get('/', protect, getMyAgreements);

// POST /api/agreements -> Naya agreement banana
router.post('/', protect, createAgreement);

// PUT /api/agreements/sign/:id -> Digital sign karna
router.put('/sign/:id', protect, signAgreement);

module.exports = router;