const Document = require('../models/Document');

// @desc    Upload a new document
// @route   POST /api/documents/upload
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const newDoc = await Document.create({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
      url: `http://localhost:5000/uploads/${req.file.filename}`,
      ownerId: req.user._id
    });

    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my documents (For Entrepreneur Dashboard)
// @route   GET /api/documents
const getMyDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ ownerId: req.user._id });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get documents by User ID (For Investor to see)
// @route   GET /api/documents/user/:userId
const getUserDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ ownerId: req.params.userId });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument, getMyDocuments, getUserDocuments };