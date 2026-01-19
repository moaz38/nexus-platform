const Agreement = require('../models/Agreement');
const mongoose = require('mongoose');

// ✅ Get My Agreements (For Both Investor & Entrepreneur)
exports.getMyAgreements = async (req, res) => {
  try {
    // console.log("Fetching agreements for User ID:", req.user._id);

    const agreements = await Agreement.find({
      $or: [
        { entrepreneurId: req.user._id }, 
        { investorId: req.user._id }
      ]
    })
    .populate('entrepreneurId', 'name email') // Entrepreneur ki details layein
    .populate('investorId', 'name email')     // Investor ki details layein
    .sort({ createdAt: -1 }); // Newest pehle

    // console.log("Found Agreements:", agreements.length);
    res.json(agreements);
  } catch (error) {
    console.error("Error fetching agreements:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create Agreement (Fixed ID Saving)
exports.createAgreement = async (req, res) => {
  try {
    console.log("🚀 Creating Agreement...");
    console.log("Body Data:", req.body);
    console.log("Logged In User (Entrepreneur):", req.user._id);

    const { investorId, documentTitle, documentContent } = req.body;

    if (!investorId || !documentTitle || !documentContent) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Naya Agreement Banayein
    const agreement = await Agreement.create({
      entrepreneurId: req.user._id, // Jo logged in hai wo Entrepreneur hai
      investorId: investorId,       // Jisko bhej rahe hain
      documentTitle,
      documentContent,
      status: 'pending'             // Default status
    });

    console.log("✅ Agreement Created Successfully:", agreement);
    res.status(201).json(agreement);

  } catch (error) {
    console.error("❌ Error creating agreement:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Sign Agreement (Milestone 5)
exports.signAgreement = async (req, res) => {
  try {
    const { signatureData, role } = req.body; 
    const agreement = await Agreement.findById(req.params.id);

    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

    // Signature Save Karein
    if (role === 'entrepreneur') {
        agreement.entrepreneurSignature = signatureData;
    } else if (role === 'investor') {
        agreement.investorSignature = signatureData;
    }

    // Check karein ke kya dono ne sign kar diya?
    if (agreement.entrepreneurSignature && agreement.investorSignature) {
      agreement.status = 'completed';
      agreement.signedAt = Date.now();
    } else {
      agreement.status = 'partially_signed'; // Agar aik ne kiya hai
    }

    await agreement.save();
    console.log("✍ Agreement Signed by:", role);
    res.json({ message: 'Document signed successfully', agreement });
  } catch (error) {
    console.error("Error signing:", error);
    res.status(500).json({ message: error.message });
  }
};