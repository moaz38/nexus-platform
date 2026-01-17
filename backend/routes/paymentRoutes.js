const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User'); 

// 1. 💳 Stripe Payment Intent Process
router.post('/process', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Stripe ko amount hamesha cents mein bhejna hota hai ($1 = 100 cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: 'usd',
      metadata: { userId: req.user._id.toString() }
    });

    console.log(`💰 Payment Intent Created: ${paymentIntent.id} for User: ${req.user._id}`);
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Stripe Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 2. ✅ CONFIRM UPGRADE (Premium Status Update + Email Mockup)
router.post('/confirm-upgrade', protect, async (req, res) => {
  try {
    console.log("🔥 Upgrade Route Hit for User:", req.user._id);

    const user = await User.findById(req.user._id);

    if (user) {
      // User ko premium mark karein
      user.isPremium = true;
      await user.save();
      
      // ✅ Milestone 6 Requirement: Email Notification Mockup
      console.log(`📧 SUCCESS: Sending Premium Welcome Email to: ${user.email}`);
      console.log(`✅ Database Updated: ${user.name} is now a Premium Member`);

      res.status(200).json({ 
        success: true, 
        isPremium: true,
        message: "Congratulations! You are now a Premium Member." 
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("❌ Upgrade Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;