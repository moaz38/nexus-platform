const Agreement = require('../models/Agreement');

// User ke agreements dhoondna
exports.getMyAgreements = async (req, res) => {
  try {
    const agreements = await Agreement.find({
      $or: [{ entrepreneurId: req.user._id }, { investorId: req.user._id }]
    }).populate('entrepreneurId investorId', 'name email');
    
    res.json(agreements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Naya agreement banana
exports.createAgreement = async (req, res) => {
  try {
    const { investorId, documentContent, documentTitle } = req.body;
    const agreement = await Agreement.create({
      entrepreneurId: req.user._id,
      investorId,
      documentTitle,
      documentContent,
      status: 'pending'
    });
    res.status(201).json(agreement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Digital Signature save karna (Milestone 5)
exports.signAgreement = async (req, res) => {
  try {
    const { signatureData, role } = req.body; 
    const agreement = await Agreement.findById(req.params.id);

    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

    if (role === 'entrepreneur') agreement.entrepreneurSignature = signatureData;
    else if (role === 'investor') agreement.investorSignature = signatureData;

    if (agreement.entrepreneurSignature && agreement.investorSignature) {
      agreement.status = 'completed';
      agreement.signedAt = Date.now();
    } else {
      agreement.status = 'partially_signed';
    }

    await agreement.save();
    res.json({ message: 'Document signed successfully', agreement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};