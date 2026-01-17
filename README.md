# Nexus - Investor & Entrepreneur Collaboration Platform

## 📅 Final Submission: 17th January 2026
This project is part of the Full Stack Development Internship. All core milestones have been successfully integrated.

## ✅ Features Implemented:
* **Authentication & Profiles:** Secure JWT login and role-based access for Investors and Entrepreneurs.
* **Meeting System:** Full API support for scheduling, accepting, and rejecting meetings.
* **Video Calling:** WebRTC enabled signaling server for real-time collaboration.
* **Document Chamber:** Multer-based document upload and metadata storage.
* **Payment Simulation:** Stripe mock integration for transaction simulation.
* **Security:** Password hashing (bcrypt) and protected API routes.

## 🛠️ Tech Stack:
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB

## 🔌 API Documentation (Quick Links):
- `POST /api/auth/login` - User login
- `GET /api/users?role=investor` - Fetch investor list
- `POST /api/meetings/schedule` - Schedule a meeting
- `PUT /api/users/profile` - Update profile and upload avatar