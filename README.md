# CareerForge – AI-Powered Placement & Interview Platform

> **Modern Full-Stack Campus Placement & Technical Interview Platform**  
> *Built with React.js, Node.js, Express.js, MongoDB, JWT, Socket.io, and Google Gemini AI*

---

## 🌟 Platform Highlights

- 👨‍🎓 **Student Hub**:
  - **Dynamic ATS Resume Builder**: Live multi-section editor (Education, Experience, Projects, Skills, Certifications) with real-time ATS keyword scoring (0-100), actionable improvement tips, and instant print/PDF export.
  - **Job Discovery & 1-Click Apply**: Search campus placement and off-campus roles by title, tags, or company. 1-click apply attaching verified ATS resume and AI interview scores.
  - **Visual Application Pipeline**: Real-time status tracker (`Applied` -> `Reviewed` -> `Shortlisted` -> `Interviewing` -> `Offered` / `Rejected`) with recruiter feedback notes.

- 🤖 **Real-Time AI Technical Interview Suite**:
  - **Socket.io Powered Live Session**: Low-latency bidirectional communication between student and AI interviewer.
  - **Role-Specific Question Generation**: Tailored technical questions across Frontend, Backend, Full Stack, and Data Science for Junior, Mid, and Senior difficulty levels.
  - **Voice & Code Scratchpad**: Browser Web Speech API for voice dictation (STT) and question narration (TTS), alongside an interactive code scratchpad.
  - **Rubric-Based Instant Evaluation**: Scores technical accuracy, conceptual depth, and articulation clarity, providing actionable tips and architectural model answers.
  - **Exportable Scorecard**: Comprehensive post-interview report card with composite score, strengths, and recommendations.

- 💼 **Recruiter Talent Command Center**:
  - Post and manage software engineering job listings with salary, location, and requirements.
  - Review applicant submissions, inspect their ATS resumes, evaluate their AI technical interview scores, and move candidates through recruitment stages.

- 🛡️ **Admin Console & Platform Analytics**:
  - Platform metrics: Total Students, Total Recruiters, Active Jobs, Submitted Applications, Completed AI Interviews, and Average Score.
  - User Directory: Role-based access management (Promote/Demote between Student, Recruiter, Admin) and account moderation.
  - Market skill demand trends across active postings.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22)
- **MongoDB**: Local MongoDB daemon or MongoDB Atlas URI (Note: Server includes an automatic fallback to in-memory MongoDB if no daemon is running).

### 2. Setup & Installation
```bash
# Clone or navigate to project directory
cd career

# Install dependencies across root, server, and client
npm run install-all
```

### 3. Database Seeding
Populate the database with realistic tech jobs (Stripe, CloudNova, DataFlow Labs), sample students, recruiters, and completed AI interview sessions:
```bash
npm run seed
```

### 4. Run Development Servers
Start both the Express/Socket.io backend (`http://localhost:5000`) and the Vite/React frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

---

## 🔑 Pre-Seeded Demo Credentials

You can test all 3 roles using the **"1-Click Demo Switcher"** in the navigation bar, or log in manually:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Student** | `student@careerforge.io` | `password123` | Alex Rivera (CS Senior, ATS Score: 94, AI Score: 89%) |
| **Recruiter** | `recruiter@careerforge.io` | `password123` | Sarah Jenkins (Tech Talent Partner @ Stripe & TechCorp) |
| **Admin** | `admin@careerforge.io` | `password123` | Platform System Administrator |

---

## 🏗️ Technical Architecture

```
career/
├── client/                     # Vite + React 18 + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── api/axios.js        # Central Axios instance with JWT interceptor
│   │   ├── components/         # Navbar with demo switcher, Footer, ProtectedRoute
│   │   ├── context/            # AuthContext (state, JWT, 1-click demo login)
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page with interactive hero & metrics
│   │   │   ├── Login.jsx       # Auth login with fast-access demo cards
│   │   │   ├── Register.jsx    # Dual-role (Student/Recruiter) registration
│   │   │   ├── student/        # Dashboard, ATS Resume Builder, Jobs, Pipeline
│   │   │   ├── interview/      # Setup, Live Socket.io Room, Scorecard Report
│   │   │   ├── recruiter/      # Recruiter Dashboard, Post Job, Applicant Review
│   │   │   └── admin/          # Admin Dashboard, User Management, Analytics
│
├── server/                     # Node.js + Express.js + Socket.io + Mongoose
│   ├── config/db.js            # MongoDB connector with auto in-memory fallback
│   ├── models/                 # User, Job, Application, InterviewSession, Resume
│   ├── middleware/             # JWT protect, RBAC authorize, error handler
│   ├── controllers/            # Auth, Job, Application, Interview, Resume, Analytics
│   ├── routes/                 # RESTful API route definitions
│   ├── services/
│   │   ├── aiInterviewService.js # Gemini API integration + fallback evaluator
│   │   └── atsScorerService.js   # Resume keyword & completeness scoring
│   ├── sockets/
│   │   └── interviewSocket.js    # Real-time WebSocket handlers for AI interviews
│   └── seeder.js               # Comprehensive realistic database seeder
```

---

## 🧪 Verification & Testing

1. **Backend Health Check**:
   ```bash
   curl http://localhost:5000/api/health
   ```
2. **Student Flow**:
   - Log in as Student -> Navigate to **ATS Resume Builder** -> Edit projects/skills -> Click **Save & Calculate ATS** -> Verify score calculation.
   - Navigate to **Job Board** -> Select a position -> Click **1-Click Apply** -> Check **Application Pipeline**.
   - Navigate to **AI Interview Room** -> Select "Full Stack Developer" -> Answer questions using voice or text -> Receive instant rubric breakdown -> View final scorecard.
3. **Recruiter Flow**:
   - Switch role to Recruiter -> View active listings -> Click **Review Candidates** -> Inspect applicant ATS resume and AI interview score -> Advance stage to **Shortlisted** or **Interviewing**.
4. **Admin Flow**:
   - Switch role to Admin -> Inspect platform analytics, active jobs, and user directory table.
