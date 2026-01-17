const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },     // File ka asli naam
  type: { type: String, required: true },     // PDF, Image, etc.
  size: { type: String, required: true },     // File size (e.g. 2MB)
  url: { type: String, required: true },      // File ka rasta (path)
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kis ne upload ki
  
  // 🔥 E-SIGNATURE FIELD ADDED (Internship Requirement) 🔥
  // Is mein hum signature image ka link store karenge jo doc se linked hoga
  signatureUrl: { type: String, default: "" }, 
  
  // Metadata for versioning and status
  status: { type: String, default: 'Pending' }, 
  version: { type: String, default: '1.0' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);