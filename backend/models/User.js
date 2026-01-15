const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // --- Common Fields (Sab ke liye) ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['entrepreneur', 'investor'], required: true },
  
  // 🔥🔥🔥 YE MISSING THA - ISAY ADD KAR DIYA HAI 🔥🔥🔥
  avatarUrl: { type: String, default: "" }, 

  bio: { type: String, default: "Ready to connect." },
  location: { type: String, default: "Remote" },
  
  // ✅ NEW: Premium Status (Payment ke liye)
  isPremium: { type: Boolean, default: false },

  // --- Entrepreneur Specific Fields ---
  companyName: { type: String },
  industry: { type: String },
  skills: { type: [String] },

  // --- Investor Specific Fields ---
  investmentStage: { type: [String], default: ['Seed'] },
  investmentInterests: { type: [String], default: ['Technology'] },
  minimumInvestment: { type: String, default: "$10k" },
  maximumInvestment: { type: String, default: "$50k" },
  totalInvestments: { type: Number, default: 0 },
  portfolioCompanies: { type: [String], default: [] }, 
  
}, { timestamps: true });

// --- 🔐 Password Security ---

// 1. Password Save hone se pehlay Encrypt karo
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 2. Login ke waqt Password Match karo
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;