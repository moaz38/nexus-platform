const Stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Process Payment
// @route   POST /api/payment/process
const processPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    // Stripe hamesha "Cents" mein payment leta hai (example: $10 = 1000 cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      success: true,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: "Payment Failed", error: error.message });
  }
};

module.exports = { processPayment };