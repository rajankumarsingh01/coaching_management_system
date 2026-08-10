# 🎓 Coaching Management System

A full-stack, multi-tenant **SaaS platform** for coaching institutes/tuition centers — built with a Node.js/Express/MongoDB backend, a React (Vite) admin web dashboard, and a React Native (Expo) mobile app for Admins, Teachers, Students, and Parents.

The system digitizes the complete lifecycle of running a coaching institute: student admissions & CRM, batch management, attendance, fee collection with online payments, salary payouts, tests & results, homework, digital content (notes/lectures), an AI doubt-solving tutor, gamification, real-time notifications, and analytics — all under one roof, isolated per institute (multi-tenant).

---

## 📦 Project Structure

This is a monorepo containing three independent applications:

| Folder | Stack | Purpose |
|---|---|---|
| `backend/` | Node.js, Express 5, MongoDB (Mongoose) | REST API, business logic, auth, payments, AI, real-time sockets |
| `admin-web/` | React 19, Vite, Tailwind CSS | Web dashboard for Institute Admins / Super Admins |
| `mobile-app/` | React Native (Expo, Expo Router), TypeScript | Cross-platform app for Super Admin, Admin, Teacher, Student, and Parent roles |

---

## 🧩 Core Modules & Features

### 1. Multi-Tenant Institute Management
- Onboard multiple coaching institutes on a single platform (SaaS model)
- Institute-level data isolation (tenant filtering on every query)
- Institute subscription lifecycle — **Trial / Active / Suspended**
- Custom branding per institute (logo, name, theme) — **Branding module**
- Auto-generated marketing **poster generator** for institutes

### 2. Authentication & Role-Based Access Control (RBAC)
- JWT-based authentication with **access + refresh tokens**
- Secure password hashing with `bcrypt`
- Forgot/reset password flow
- Five distinct roles with dedicated dashboards:
  - **Super Admin** — platform owner, onboards institutes
  - **Admin** — manages a single institute
  - **Teacher** — manages batches, content, tests, attendance
  - **Student** — attends classes, gives tests, tracks progress
  - **Parent** — monitors child's attendance, fees, homework & results
- Route-level and ownership-level authorization guards (`role.middleware`, `ownershipGuard`)

### 3. User Management
- Create/manage Admins, Teachers, Students, and Parents
- Bulk user operations, profile management, change password
- Parent-student linking for progress monitoring

### 4. Batch Management
- Create and manage batches/classes/courses
- Assign teachers and students to batches
- Batch-wise content, homework, tests, and fee structuring

### 5. Attendance System
- Daily attendance marking (teacher/admin side)
- Student & parent-facing attendance history/reports
- Attendance analytics per batch/student

### 6. Fee Management & Online Payments
- Create fee structures per batch/student
- **Razorpay** payment gateway integration (with secure webhook signature verification)
- Auto-generated **PDF fee receipts** (`pdfkit`)
- Fee overview dashboard & defaulter tracking
- Automated **fee reminder** notifications/emails

### 7. Salary Management
- Manage teacher/staff salary records and payout history

### 8. Tests, Results & Leaderboard
- Create tests with question banks (manual entry or **bulk upload via spreadsheet**)
- AI-assisted **question generation**
- Student test attempts and auto-evaluated results
- Batch-wise **leaderboard** and performance ranking
- **Weak-topic analysis** to identify areas needing improvement

### 9. Homework & Submissions
- Assign homework to batches with due dates
- Students submit homework (file/document upload support)
- Teacher review and submission tracking

### 10. Digital Content Library (Notes & Lectures)
- Upload and share study notes (Cloudinary-backed file storage)
- Manage recorded/live lecture links per batch

### 11. AI-Powered Doubt Solving (AI Tutor)
- Students can ask academic doubts to an AI tutor (OpenRouter/LLM integration)
- Strict system-level guardrails: only answers academic questions, explains step-by-step, supports Hindi/English/Hinglish
- Daily usage limits per student with AI usage tracking/logging

### 12. Gamification & Engagement
- Badges/achievements system for student milestones
- Daily **activity streaks** to encourage consistency
- Motivates students through recognition and rewards

### 13. Leads / Admissions CRM
- Track prospective students through a lead pipeline: **New → Contacted → Trial Given → Enrolled / Lost**
- Helps institutes convert inquiries into admissions

### 14. Calendar & Events
- Institute-wide event/calendar management (exams, holidays, PTMs, etc.)
- Role-specific event visibility

### 15. Notifications & Real-Time Updates
- In-app notification system
- **Socket.IO**-powered real-time updates (live presence, instant alerts)
- Email notifications via **Resend**

### 16. Analytics Dashboard
- Institute-wide KPIs: attendance %, fee collection, test performance, engagement
- Data aggregation for Admin/Super Admin decision-making

### 17. Audit Logging
- Tracks critical actions across the system for accountability and traceability

### 18. Internationalization (i18n)
- Multi-language support on both **admin-web** and **mobile-app** (`i18next`)

### 19. Security & Reliability
- `helmet` for HTTP security headers
- Strict CORS policy with origin whitelisting
- Centralized error handling middleware
- Request validation using `zod` schemas per module
- Structured logging via `winston` + `morgan`

---

## 🛠️ Tech Stack

**Backend**
- Node.js, Express 5, MongoDB + Mongoose 9
- JWT, bcrypt — Authentication & security
- Razorpay — Payments
- Cloudinary — Media/file storage
- Resend — Transactional email
- Socket.IO — Real-time communication
- PDFKit — Receipt/PDF generation
- Multer, csv-parser, xlsx — File & bulk-data uploads
- Zod — Schema validation
- Winston, Morgan — Logging

**Admin Web**
- React 19, Vite 8, Tailwind CSS 3
- React Router 7, Axios, i18next
- html-to-image — Poster/graphic export

**Mobile App**
- React Native 0.81 + Expo 54 (Expo Router — file-based, role-based routing)
- TypeScript, Axios, Socket.IO client
- Expo modules: Image Picker, Document Picker, Notifications, Secure Store, Sharing, View Shot
- i18next for localization

**Architecture Pattern**
- Backend follows a clean **modular layered architecture**: `routes → controller → service → repository → model` per feature module, ensuring separation of concerns and testability.

---

## 📁 Backend Module List (API Domains)

```
auth · users · institutes · batches · attendance · fees · salaries
notes · lectures · tests · results · homework · submissions
notifications · calendar · gamification · presence · leads
doubts (AI) · analytics · auditLog · branding
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- MongoDB (local or Atlas)
- npm

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT secrets, Razorpay, Cloudinary, Resend, OpenRouter keys
npm run dev             # starts server with nodemon
npm run seed:super-admin   # creates the first Super Admin user
```

### 2. Admin Web Setup
```bash
cd admin-web
npm install
cp .env.example .env   # set VITE_API_BASE_URL
npm run dev
```

### 3. Mobile App Setup
```bash
cd mobile-app
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_BASE_URL to your local IP
npx expo start
```

---

## 🔑 Environment Variables (Backend)

| Variable | Description |
|---|---|
| `PORT` | API server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | Token expiry durations |
| `CLIENT_URL` | Allowed frontend origin for CORS |
| Razorpay keys | Payment gateway credentials |
| Cloudinary keys | Media upload credentials |
| Resend API key | Transactional email |
| OpenRouter API key | AI doubt-solving tutor |

> See `.env.example` in each folder for the exact keys required.

---

## 👥 User Roles Summary

| Role | Key Capabilities |
|---|---|
| **Super Admin** | Onboard institutes, platform-wide oversight |
| **Admin** | Full institute management — users, batches, fees, salaries, content, analytics |
| **Teacher** | Batches, attendance, homework, tests, content, leaderboard |
| **Student** | Attendance, tests, homework, notes/lectures, AI doubts, gamification, leaderboard |
| **Parent** | View child's attendance, fees, homework, and results |

---

## 📄 License

This project does not currently specify a license. Add a `LICENSE` file to define usage terms.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to fork the repo and submit a pull request.