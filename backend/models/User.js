const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['entrepreneur', 'investor'], required: true },
  bio: { type: String, default: "Experienced Investor looking for great ideas." },
  location: { type: String, default: "Remote" },
  
  // Investor Specific Fields
  investmentStage: { type: [String], default: ['Seed'] },
  investmentInterests: { type: [String], default: ['Technology'] },
  minimumInvestment: { type: String, default: "$10k" },
  maximumInvestment: { type: String, default: "$50k" },
  totalInvestments: { type: Number, default: 0 },
  portfolioCompanies: { type: [String], default: [] }, // Companies ke naam
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);