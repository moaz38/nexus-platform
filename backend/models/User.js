const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['entrepreneur', 'investor'], required: true },
  avatarUrl: { type: String, default: "" }, 
  bio: { type: String, default: "Ready to connect." },
  location: { type: String, default: "Remote" },
  isPremium: { type: Boolean, default: false },
  
  // Extra fields
  companyName: { type: String },
  industry: { type: String },
  skills: { type: [String] },
  investmentStage: { type: [String], default: ['Seed'] },
  investmentInterests: { type: [String], default: ['Technology'] },
  minimumInvestment: { type: String, default: "$10k" },
  maximumInvestment: { type: String, default: "$50k" },
  totalInvestments: { type: Number, default: 0 },
  portfolioCompanies: { type: [String], default: [] }, 
}, { timestamps: true });

// 🔥 FIX: pre-save hook mein arrow function use nahi karna
userSchema.pre('save', async function () {
  // Agar password modify nahi hua to yahan se nikal jao
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // ✅ Note: Yahan 'next()' likhne ki zaroorat nahi agar async function use kar rahe hon
  } catch (error) {
    throw error; // Direct error throw karein
  }
});

// ✅ Password Match Function
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;