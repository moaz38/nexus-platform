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

// ✅ Password Match karne ke liye sirf ye method rakhein
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;