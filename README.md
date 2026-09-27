<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&pause=1000&color=2196F3&center=true&vCenter=true&width=700&lines=🚌+Campus+Bus+Pass+Management;University+Transport+System;MERN+Stack+Web+Application" alt="Typing SVG" />

# 🚌 Campus Bus Pass Management System

**A full-stack MERN web application for managing university bus transportation — covering student registration, route management, bus pass generation, driver verification, and attendance tracking.**

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-REST_API-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<br/>

[![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/Campus-Bus-Pass-Management-System?style=flat-square)](https://github.com/YOUR_USERNAME/Campus-Bus-Pass-Management-System/issues)
[![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/Campus-Bus-Pass-Management-System?style=flat-square)](https://github.com/YOUR_USERNAME/Campus-Bus-Pass-Management-System/network)
[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/Campus-Bus-Pass-Management-System?style=flat-square)](https://github.com/YOUR_USERNAME/Campus-Bus-Pass-Management-System/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<br/>

[🚀 Features](#-features) • [🏗️ Architecture](#%EF%B8%8F-architecture) • [📂 Folder Structure](#-folder-structure) • [🗄️ Database Models](#%EF%B8%8F-database-models) • [🚦 Getting Started](#-getting-started) • [🔌 API Overview](#-api-overview) • [👥 Team](#-team)

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#%EF%B8%8F-architecture)
- [Complete System Flow](#-complete-system-flow)
- [Folder Structure](#-folder-structure)
- [Database Models](#%EF%B8%8F-database-models)
- [Authentication](#-authentication)
- [API Overview](#-api-overview)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Git Workflow](#-git-workflow)
- [Team & Branches](#-team--branches)
- [GitHub Issues](#-github-issues)
- [Testing Checklist](#-testing-checklist)
- [Definition of Done](#-definition-of-done)
- [Future Scope](#-future-scope)
- [Contributors](#-contributors)

---

## 🎯 About the Project

> **Campus Bus Pass Management System** is a centralized digital platform that replaces manual university bus management. It serves **Students**, **Drivers**, and **Admins** with separate role-based modules — from transport requests and bus allocation to driver verification and real-time attendance tracking.

### 🔑 Key Highlights

- ✅ Role-based access control (Student / Driver / Admin)
- ✅ Permanent digital Bus Pass ID per student (`GSFC-01-001`)
- ✅ Driver-side Bus Pass verification & attendance marking
- ✅ Admin controls for the full transport lifecycle
- ✅ Duplicate attendance prevention
- ✅ Bus problem reporting system
- ✅ JWT-secured REST APIs

---

## ✨ Features

<table>
<thead>
<tr>
<th>👨‍🎓 Student</th>
<th>🚌 Driver</th>
<th>👨‍💼 Admin</th>
</tr>
</thead>
<tbody>
<tr>
<td>Register & Login</td>
<td>View Assigned Bus</td>
<td>Manage Students & Drivers</td>
</tr>
<tr>
<td>Select Pickup Point</td>
<td>View Assigned Route</td>
<td>Manage Buses & Routes</td>
</tr>
<tr>
<td>Submit Transport Request</td>
<td>View Assigned Students</td>
<td>Manage Pickup Points</td>
</tr>
<tr>
<td>Track Request Status</td>
<td>Verify Bus Pass ID</td>
<td>Approve / Reject Requests</td>
</tr>
<tr>
<td>View Bus Assignment</td>
<td>Mark Attendance</td>
<td>Allocate Students to Buses</td>
</tr>
<tr>
<td>View Permanent Bus Pass</td>
<td>Prevent Duplicate Records</td>
<td>Generate Bus Pass IDs</td>
</tr>
<tr>
<td>View Attendance History</td>
<td>Report Bus Problems</td>
<td>View Reports & Analytics</td>
</tr>
</tbody>
</table>

---

## 🛠️ Technology Stack

<table>
<tr>
<td>

**Frontend**
- ⚛️ React 18
- ⚡ Vite
- 🌐 Axios
- 🎨 CSS3
- 🔄 React Context API

</td>
<td>

**Backend**
- 🟢 Node.js
- 🚂 Express.js
- 🔐 JSON Web Token (JWT)
- 🔒 bcryptjs
- 📧 Nodemailer

</td>
<td>

**Database**
- 🍃 MongoDB Atlas
- 🐍 Mongoose ODM

</td>
<td>

**Tools**
- 🐙 Git & GitHub
- 🧪 Postman
- 💻 VS Code

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                     FRONTEND                        │
│            React  +  Vite  +  Axios                 │
│                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│   │ Student  │  │  Driver  │  │    Admin     │     │
│   └──────────┘  └──────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────┘
                         │  REST API (HTTP/HTTPS)
                         ▼
┌─────────────────────────────────────────────────────┐
│                     BACKEND                         │
│           Node.js  +  Express.js                    │
│                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│   │ Student  │  │  Driver  │  │    Admin     │     │
│   │  Routes  │  │  Routes  │  │    Routes    │     │
│   └──────────┘  └──────────┘  └──────────────┘     │
│                                                     │
│            JWT Middleware  +  Role Guard            │
└────────────────────────┬────────────────────────────┘
                         │  Mongoose
                         ▼
┌─────────────────────────────────────────────────────┐
│                  MONGODB ATLAS                      │
│                                                     │
│  users  •  students  •  drivers  •  admins          │
│  buses  •  routes  •  pickuppoints                  │
│  transportrequests  •  busassignments               │
│  attendances  •  busproblems                        │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Complete System Flow

```
Student Registration
        │
        ▼
  Student Login ──────────────────────────────────────────┐
        │                                                  │
        ▼                                                  ▼
Select Pickup Point                                  Driver Login
        │                                                  │
        ▼                                                  ▼
Submit Transport Request                         View Assigned Bus
        │                                        View Assigned Route
        ▼                                        View Pickup Points
Admin Reviews Request                                      │
        │                                                  │
   ┌────┴─────┐                                            │
   ▼          ▼                                            │
Approve    Reject ──→ Student sees rejection reason        │
   │                                                       │
   ▼                                                       │
Allocate Student                                           │
   │                                                       │
   ├──→ Bus Assigned                                       │
   ├──→ Route Assigned                                     │
   ├──→ Pickup Point Assigned                              │
   └──→ Permanent Bus Pass ID Generated                    │
                │                                          │
                ▼                                          │
         Student Views Assignment ────────────────────────┘
                                                           │
                                                    Driver Verifies
                                                     Bus Pass ID
                                                           │
                                                  ┌────────┴────────┐
                                                  ▼                 ▼
                                             Valid Pass       Invalid Pass
                                                  │
                                                  ▼
                                          Mark Attendance
                                          (Duplicate Check)
                                                  │
                                                  ▼
                                          Admin Views Reports
```

---

## 📂 Folder Structure

```
Campus-Bus-Pass-Management-System/
│
├── 📁 frontend/
│   ├── 📁 common/               # Shared across all modules
│   │   ├── components/          # Reusable UI (Navbar, Sidebar, Modal...)
│   │   ├── pages/               # Login, Signup, Dashboard
│   │   ├── services/            # authService.js
│   │   ├── context/             # AuthContext.jsx
│   │   ├── utils/
│   │   └── assets/
│   │
│   ├── 📁 student/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── 📁 driver/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   │
│   └── 📁 admin/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── utils/
│
├── 📁 backend/
│   ├── 📁 common/
│   │   ├── middleware/          # JWT verify, role auth, error handler
│   │   ├── services/
│   │   ├── utils/
│   │   └── config/             # db.js (MongoDB connection)
│   │
│   ├── 📁 database/
│   │   ├── models/             # All 11 Mongoose models
│   │   ├── seed/
│   │   └── migrations/
│   │
│   ├── 📁 student/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── validations/
│   │   └── studentRoutes.js
│   │
│   ├── 📁 driver/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── validations/
│   │   └── driverRoutes.js
│   │
│   ├── 📁 admin/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── validations/
│   │   └── adminRoutes.js
│   │
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🗄️ Database Models

The project uses exactly **11 Mongoose models**.

| # | Model | File | Purpose |
|---|-------|------|---------|
| 1 | **User** | `User.js` | Authentication & account management |
| 2 | **Student** | `Student.js` | Student personal & enrollment info |
| 3 | **Driver** | `Driver.js` | Driver profile & credentials |
| 4 | **Admin** | `Admin.js` | Admin profile |
| 5 | **Bus** | `Bus.js` | Bus details & capacity |
| 6 | **Route** | `Route.js` | Route path & stops |
| 7 | **PickupPoint** | `PickupPoint.js` | Individual pickup locations |
| 8 | **TransportRequest** | `TransportRequest.js` | Student transport requests (Pending / Approved / Rejected) |
| 9 | **BusAssignment** | `BusAssignment.js` | Student ↔ Bus / Route / Pickup allocation |
| 10 | **Attendance** | `Attendance.js` | Daily attendance records |
| 11 | **BusProblem** | `BusProblem.js` | Driver-reported bus issues |

### Model Relationships

```
User ──────────────┬──→ Student
                   ├──→ Driver
                   └──→ Admin

Student ───────────┬──→ TransportRequest
                   ├──→ BusAssignment
                   └──→ Attendance

BusAssignment ─────┬──→ Student
                   ├──→ Bus
                   ├──→ Route
                   └──→ PickupPoint

Attendance ────────┬──→ Student
                   ├──→ Bus
                   ├──→ Route
                   └──→ Driver

BusProblem ────────┬──→ Bus
                   └──→ Driver
```

---

## 🔐 Authentication

Authentication is handled using **JWT (JSON Web Tokens)** with **bcryptjs** password hashing.

```
User Submits Credentials
         │
         ▼
  Validate Email + Password
         │
         ▼
  Compare bcrypt Hash
         │
         ▼
    Generate JWT Token
         │
         ▼
    Return Token to Frontend
         │
         ▼
  Frontend Stores Auth State (Context)
         │
         ▼
  Protected API Requests (Bearer Token)
         │
         ▼
  Middleware Verifies Token → Checks Role
         │
    ┌────┼────┐
    ▼    ▼    ▼
 Student Driver Admin
  APIs   APIs  APIs
```

**Role values used in the system:**
```
student  |  driver  |  admin
```

> ⚠️ Do not change role names between modules — all modules must use the same role strings.

---

## 🔌 API Overview

All API responses follow a consistent format:

```json
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}

// Error
{
  "success": false,
  "message": "Something went wrong"
}
```

### Endpoint Categories

| Module | Prefix | Examples |
|--------|--------|---------|
| Auth | `/api/auth` | `/login`, `/signup`, `/logout` |
| Student | `/api/student` | `/profile`, `/request`, `/assignment`, `/attendance` |
| Driver | `/api/driver` | `/dashboard`, `/verify-pass`, `/attendance`, `/problem` |
| Admin | `/api/admin` | `/students`, `/buses`, `/routes`, `/requests`, `/reports` |

### Request Flow

```
React (Axios) → Express Route → Auth Middleware → Role Guard → Controller → Service → Mongoose → MongoDB
```

---

## 🌱 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# backend/.env

MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret_key_here
PORT=5000
```

> 🚫 **Never commit `.env` to GitHub.** It is already listed in `.gitignore`.

> 💡 `JWT_SECRET` is a secret key you create yourself — it is **not** your MongoDB password.

---

## 🚦 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- MongoDB Atlas account
- Git

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Campus-Bus-Pass-Management-System.git
cd Campus-Bus-Pass-Management-System
```

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file (see [Environment Variables](#-environment-variables) above).

```bash
npm run dev
# Backend running at: http://localhost:5000
```

### Step 3 — Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
# Frontend running at: http://localhost:5173
```

---

## 🔀 Git Workflow

### Branch Strategy

```
main
 ├── feature/common-auth     ← Member 1
 ├── feature/driver          ← Member 2
 ├── feature/student         ← Member 3
 └── feature/admin           ← Member 4
```

### Daily Workflow

```bash
# 1. Get latest main
git checkout main
git pull origin main

# 2. Switch to your branch
git checkout feature/your-module

# 3. Work on your feature...

# 4. Stage & commit
git add .
git commit -m "feat: add student transport request form"

# 5. Push your branch
git push -u origin feature/your-module

# 6. Open Pull Request on GitHub → main
```

### Commit Message Convention

```
feat:     new feature
fix:      bug fix
refactor: code restructure
docs:     documentation
test:     testing
chore:    maintenance
```

**Good examples:**
```bash
git commit -m "feat: add driver bus pass verification"
git commit -m "fix: prevent duplicate attendance records"
git commit -m "feat: implement admin student allocation"
```

### ⚠️ Git Rules

```
❌  git push --force         (never force push to main)
❌  git reset --hard         (without team agreement)
❌  git clean -fd            (without team agreement)
✅  Always run git status before committing
✅  Always pull main before starting major work
✅  Keep commits small and meaningful
```

---

## 👥 Team & Branches

| Member | Branch | Module | Folder |
|--------|--------|--------|--------|
| Member 1 | `feature/common-auth` | Common / Authentication | `frontend/common/` + `backend/common/` |
| Member 2 | `feature/driver` | Driver Module | `frontend/driver/` + `backend/driver/` |
| Member 3 | `feature/student` | Student Module | `frontend/student/` + `backend/student/` |
| Member 4 | `feature/admin` | Admin / Facility | `frontend/admin/` + `backend/admin/` |

### Module Dependency

```
Common / Authentication
        │
        ├──────────────────┐
        ▼                  ▼
    Student             Driver
        │                  │
        └──────┬───────────┘
               ▼
            Admin
```

> Coordinate on: model field names, API response format, JWT payload structure, role names, and Bus Pass ID format before writing integration code.

---

## 📋 GitHub Issues

### 🟦 Issue 1 — Common / Authentication

**Branch:** `feature/common-auth` | **Owner:** Member 1

```
[ ] Login page & form
[ ] Signup page & form
[ ] AuthContext (React Context API)
[ ] JWT generation & verification
[ ] bcryptjs password hashing
[ ] Role-based route protection
[ ] Logout functionality
[ ] Common dashboard shell
[ ] Common API service (authService.js)
[ ] Error handling middleware
```

**Done when:** Any role can register (where applicable), log in, access protected routes, and be blocked from other roles' APIs.

---

### 🟩 Issue 2 — Driver Module

**Branch:** `feature/driver` | **Owner:** Member 2

```
[ ] Driver dashboard
[ ] View assigned bus
[ ] View assigned route & pickup points
[ ] View assigned students list
[ ] Bus Pass ID verification (e.g. GSFC-01-001)
[ ] Assignment validation (bus + route check)
[ ] Mark attendance
[ ] Duplicate attendance prevention
[ ] View today's attendance
[ ] Report bus problem
```

**Done when:** Driver can log in, verify Bus Pass IDs, mark attendance without duplicates, and report problems.

---

### 🟨 Issue 3 — Student Module

**Branch:** `feature/student` | **Owner:** Member 3

```
[ ] Student registration
[ ] Student profile page
[ ] Pickup point selection
[ ] Submit transport request
[ ] View request status (Pending / Approved / Rejected)
[ ] View rejection reason (if rejected)
[ ] View assigned bus, route & pickup point
[ ] View permanent Bus Pass ID
[ ] View attendance history
```

**Done when:** Student can register, submit a transport request, and view their full assignment including Bus Pass ID and attendance.

---

### 🟥 Issue 4 — Admin / Facility Module

**Branch:** `feature/admin` | **Owner:** Member 4

```
[ ] Admin dashboard
[ ] Student management (view, manage)
[ ] Driver management (add, view, assign)
[ ] Bus management (add, update, delete, view)
[ ] Route management (add, update, view)
[ ] Pickup point management
[ ] View & process transport requests
[ ] Approve / Reject requests with reason
[ ] Allocate student → Bus + Route + Pickup Point
[ ] Generate permanent Bus Pass ID
[ ] Assign driver to bus
[ ] View attendance records
[ ] View bus problem reports
[ ] Generate reports
```

**Done when:** Admin can manage all entities, process requests, allocate students with a Bus Pass ID, and monitor the system.

---

## 🧪 Testing Checklist

### Common / Auth
```
[ ] Signup with valid data
[ ] Login with valid credentials
[ ] Login with invalid credentials (should fail gracefully)
[ ] JWT token returned correctly
[ ] Protected route blocks unauthenticated users
[ ] Role guard blocks cross-role access
[ ] Logout clears session
```

### Student
```
[ ] Registration saves to DB
[ ] Login works
[ ] Pickup point selection updates correctly
[ ] Transport request created with Pending status
[ ] Status changes to Approved/Rejected after admin action
[ ] Rejection reason visible
[ ] Assignment (bus, route, pickup, pass ID) visible
[ ] Attendance history loads correctly
```

### Driver
```
[ ] Login works
[ ] Assigned bus/route displayed correctly
[ ] Valid Bus Pass ID returns student info
[ ] Invalid Bus Pass ID returns error
[ ] Attendance marked on valid verification
[ ] Duplicate attendance rejected
[ ] Bus problem report saved
```

### Admin
```
[ ] All CRUD operations for Bus, Route, PickupPoint
[ ] Transport requests visible
[ ] Approve/Reject with reason works
[ ] Student allocation saves BusAssignment record
[ ] Bus Pass ID generated correctly (GSFC-XX-XXX format)
[ ] Attendance records visible
[ ] Bus problems visible
```

**API Testing order in Postman:**
```
1. Auth → 2. Student → 3. Admin → 4. Assignment → 5. Driver → 6. Attendance → 7. Bus Problems
```

---

## ✅ Definition of Done

A feature is **complete** only when all boxes are checked:

```
[ ] Code implemented in the correct module folder
[ ] Input validation added
[ ] Authentication middleware applied
[ ] Role authorization applied
[ ] API tested in Postman
[ ] Frontend integrated and tested
[ ] Error handling added (no unhandled crashes)
[ ] No console errors or broken imports
[ ] No unnecessary/temp files committed
[ ] Meaningful git commit created
[ ] Feature branch pushed to GitHub
[ ] GitHub Issue checklist updated
[ ] Pull Request created (if feature is complete)
```

---

## 🚫 Out of Scope

The following are **intentionally excluded** from the current version:

```
❌ BusPass.js model (pass ID lives in BusAssignment)
❌ Payment system
❌ QR code generation
❌ Student/bus transfer requests
❌ Automatic bus/driver replacement
❌ Real-time tracking (Socket.IO)
❌ Mobile application
```

---

## 🔮 Future Scope

| Feature | Description |
|---------|-------------|
| 📍 Real-time Tracking | Live bus location on map using GPS |
| 🔳 QR Bus Pass | QR code-based pass scanning |
| 📱 Mobile App | React Native companion app |
| 📊 Analytics Dashboard | Attendance trends & route analytics |
| 🔔 Notifications | Email/SMS alerts for approvals & delays |
| 🗺️ Route Optimization | Shortest path suggestions |
| 🧾 PDF Reports | Downloadable attendance & transport reports |

---

## 📊 Recommended Development Order

```
1.  Project structure setup
2.  MongoDB Atlas connection (db.js)
3.  All 11 Mongoose models
4.  JWT Authentication (login/signup)
5.  Common module (middleware, context)
6.  Student module (registration → request)
7.  Admin module (request approval → allocation)
8.  Driver module (verification → attendance)
9.  Bus Assignment integration
10. Bus Pass verification flow
11. Attendance with duplicate prevention
12. Bus problem reports
13. Integration testing (all modules)
14. Final review & PR merges
```

---

## 👨‍💻 Contributors

<table>
<tr>
<td align="center">
<b>Member 1</b><br/>
Common / Authentication<br/>
<code>feature/common-auth</code>
</td>
<td align="center">
<b>Member 2</b><br/>
Driver Module<br/>
<code>feature/driver</code>
</td>
<td align="center">
<b>Member 3</b><br/>
Student Module<br/>
<code>feature/student</code>
</td>
<td align="center">
<b>Member 4</b><br/>
Admin / Facility<br/>
<code>feature/admin</code>
</td>
</tr>
</table>

> 📝 Replace "Member 1–4" with your actual names and GitHub profile links.

---

## 📜 License

This project is developed for **academic and educational purposes** at the university level.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by the Campus Bus Team

</div>
