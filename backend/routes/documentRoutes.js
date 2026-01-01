const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDocument, getMyDocuments, getUserDocuments } = require('../controllers/documentController'); // ✅ getUserDocuments added
const { protect } = require('../middleware/authMiddleware');

// --- Multer Settings ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// --- Routes ---
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getMyDocuments);
router.get('/user/:userId', protect, getUserDocuments); // ✅ NEW ROUTE for Profile View

module.exports = router;