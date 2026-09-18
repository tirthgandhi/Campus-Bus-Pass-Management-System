# Smart University Bus Transport Management System

A full-stack campus bus pass management system divided among 4 team members with clear separation of concerns.

---

## Project Structure

```
Campus-Bus-Pass-Management-System/
├── frontend/
│   ├── common/          ← Login, Signup, Auth context, shared components
│   ├── student/         ← Student dashboard, pass, profile, attendance
│   ├── driver/          ← Driver dashboard, passengers, attendance marking
│   └── admin/           ← Admin dashboard, routes, buses, reports
│
├── backend/
│   ├── common/          ← Auth, JWT middleware, email utility, DB config
│   ├── database/
│   │   └── models/      ← All Mongoose models
│   ├── student/         ← Student controllers & routes
│   ├── driver/          ← Driver controllers & routes
│   ├── admin/           ← Admin controllers & routes
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## Team Member Responsibilities

| Member | Frontend | Backend |
|--------|----------|---------|
| **Common** | `frontend/common/` | `backend/common/` |
| **Student** | `frontend/student/` | `backend/student/` |
| **Driver** | `frontend/driver/` | `backend/driver/` |
| **Admin** | `frontend/admin/` | `backend/admin/` |

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **Email**: Nodemailer (Gmail)

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Setup

1. Create a `.env` file in the **repository root** (next to this README):

```env
MONGO_URI=mongodb://localhost:27017/campus-bus
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
PORT=5000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Start the backend server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run at: `http://localhost:5000`

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register (student/driver/admin) |
| GET | `/api/auth/verify-email?token=...` | Verify email |
| POST | `/api/auth/login` | Login — returns JWT |
| GET | `/api/auth/me` | Get logged-in user info |
| POST | `/api/auth/reset-driver-password` | Reset driver password |

### Student (`/api/student`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/student/passes` | Submit transport request |
| GET | `/api/student/passes/my` | View own transport requests |
| POST | `/api/student/buspasses` | Create bus pass (after payment) |
| GET | `/api/student/buspasses/my` | View bus pass / pass ID |
| POST | `/api/student/payments` | Record payment |
| GET | `/api/student/payments/my` | View payment history |

### Driver (`/api/driver`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/driver/my-bus/passengers` | View assigned bus students |
| POST | `/api/driver/attendance` | Mark student attendance |
| GET | `/api/driver/attendance/today` | View today's attendance |

### Admin (`/api/admin`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/buses` | Add a bus |
| GET | `/api/admin/buses` | List all buses |
| GET | `/api/admin/buses/:id` | Get bus by ID |
| PUT | `/api/admin/buses/:id` | Update bus |
| DELETE | `/api/admin/buses/:id` | Delete bus |
| PUT | `/api/admin/buses/:id/driver` | Assign driver to bus |
| GET | `/api/admin/passes/pending` | View pending transport requests |
| PUT | `/api/admin/passes/:id/approve` | Approve transport request |
| PUT | `/api/admin/passes/:id/reject` | Reject transport request |
| PUT | `/api/admin/passes/:id/route` | Allocate student to route |
| POST | `/api/admin/routes` | Create route |
| GET | `/api/admin/routes` | List all routes |
| PUT | `/api/admin/routes/:id` | Update route |
| DELETE | `/api/admin/routes/:id` | Delete route |

---

## Database Models

Located in `backend/database/models/`:

| Model | Description |
|-------|-------------|
| `User.js` | Unified user model (student / driver / admin roles) |
| `Bus.js` | Bus records with driver assignment |
| `BusRoute.js` | Routes with stops and assigned bus |
| `BusPass.js` | Active bus passes linked to student, bus, payment |
| `Attendance.js` | Daily attendance records per student per bus |
| `Payment.js` | Student payment records |

---

## Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

Role-based access is enforced via the `authorize(role)` middleware in `backend/common/middleware/authMiddleware.js`.