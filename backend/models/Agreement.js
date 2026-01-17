const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  entrepreneurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentTitle: { type: String, default: "Investment Agreement" },
  documentContent: { type: String, required: true },
  
  // Signatures
  entrepreneurSignature: { type: String }, // Base64 image data
  investorSignature: { type: String },    // Base64 image data
  
  status: { 
    type: String, 
    enum: ['pending', 'partially_signed', 'completed'], 
    default: 'pending' 
  },
  signedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Agreement', agreementSchema);