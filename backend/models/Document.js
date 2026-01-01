const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },     // File ka asli naam
  type: { type: String, required: true },     // PDF, Image, etc.
  size: { type: String, required: true },     // File size (e.g. 2MB)
  url: { type: String, required: true },      // File ka rasta (path)
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kis ne upload ki
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);