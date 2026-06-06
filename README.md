# PlacePrep — Placement Preparation & Opportunity Platform

> **Full-stack MERN web application** built by Dinz Software Pvt. Ltd.  
> Targeted at Indian engineering & MBA students (Tier 2/3) preparing for campus placements.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20 LTS
- MongoDB Atlas account
- Redis (Upstash free tier)
- Cloudinary account (for media uploads)
- SendGrid account (for transactional emails)
- Razorpay account (for payments)

### 1. Clone & Install

```bash
git clone https://github.com/dinz-software/prepster.git
cd prepster

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in your keys in backend/.env

# Frontend
cp frontend/.env.example frontend/.env
# Fill in VITE_API_URL and VITE_RAZORPAY_KEY_ID
```

### 3. Seed the Database

```bash
cd backend
node src/scripts/seedQuestions.js    # Seed aptitude questions
node src/scripts/seedCompanies.js    # Seed company tracks
node src/scripts/seedJobs.js         # Seed job listings
```

### 4. Run in Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:5173`

---

## 🏗️ Architecture

```
Browser ──► React SPA (Vite) ──► Express API ──► MongoDB Atlas
                                          │──► Redis (sessions, caching)
                                          │──► Cloudinary (media)
                                          │──► SendGrid (email)
                                          └──► Razorpay (payments)
```

## 📁 Project Structure

```
prepster/
├── backend/                 # Node.js / Express API
│   ├── src/
│   │   ├── config/          # DB, Redis, Cloudinary, logger
│   │   ├── middleware/       # Auth, error handler, rate limiter
│   │   ├── modules/         # Feature modules (auth, aptitude, jobs…)
│   │   ├── jobs/            # node-cron scheduled tasks
│   │   └── scripts/         # DB seed scripts
│   └── .env.example
└── frontend/                # React + Vite SPA
    ├── src/
    │   ├── api/             # Axios API helpers per feature
    │   ├── components/      # Reusable UI components
    │   ├── pages/           # Route-level page components
    │   └── store/           # Zustand global state
    └── .env.example
```

## 🔑 Key Features

| Module | Status |
|--------|--------|
| Auth (Email + Google OAuth) | ✅ |
| User Profile & Completion | ✅ |
| Aptitude Question Bank (Admin) | ✅ |
| Adaptive Quiz Engine (Student) | ✅ |
| Performance Analytics Dashboard | ✅ |
| Company-Specific Tracks (10+) | ✅ |
| Job & Internship Feed | ✅ |
| Direct Apply & Application Tracker | ✅ |
| Employer Dashboard | ✅ |
| Razorpay Freemium Payments | ✅ |
| Admin Super Panel | ✅ |
| Landing Page | ✅ |

## 💳 Pricing

| Plan | Price | Key Features |
|------|-------|-------------|
| Free | ₹0 | 20 questions/day, 1 company track, view jobs |
| Pro Monthly | ₹299/mo | Unlimited everything, direct apply |
| Pro Annual | ₹799/yr | Same as Pro Monthly + priority support |

## 🛠️ Tech Stack

**Backend:** Node.js 20, Express 4, MongoDB Atlas, Mongoose, Redis (Upstash), JWT, Razorpay, SendGrid, Cloudinary, Passport (Google OAuth)

**Frontend:** React 18, Vite 5, Tailwind CSS, Zustand, TanStack Query, React Hook Form, Recharts, Framer Motion

---

*Built with ❤️ by Dinz Software Pvt. Ltd.*
