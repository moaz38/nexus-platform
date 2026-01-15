const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User'); // ✅ Importing User Model

// 1. Stripe Payment Intent (Ye route pehlay se chal raha hai)
router.post('/process', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: 'usd',
      metadata: { userId: req.user._id.toString() }
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 2. ✅ NEW UPGRADE ROUTE (Is file mein ye 100% chalay ga)
router.post('/confirm-upgrade', protect, async (req, res) => {
  try {
    console.log("🔥 Upgrade Route Hit for User:", req.user._id);

    const user = await User.findById(req.user._id);

    if (user) {
      user.isPremium = true;
      await user.save();
      
      console.log("✅ Database Updated: User is now Premium");
      res.status(200).json({ success: true, isPremium: true });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("❌ Upgrade Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;