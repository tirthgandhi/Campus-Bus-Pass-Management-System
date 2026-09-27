# Campus Bus Pass Management System

<p align="center">
  <strong>University bus transport, pass, assignment, and attendance management</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React and Vite">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js and Express">
  <img src="https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB and Mongoose">
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20bcryptjs-111827?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT and bcryptjs">
</p>

## Overview

The Campus Bus Pass Management System is a full-stack web application for coordinating university transportation. It provides role-based workflows for students, drivers, and administrators across transport requests, bus and route allocation, bus-pass creation, attendance, and bus-problem reporting.

The backend is an Express REST API backed by MongoDB. The frontend is a React application built with Vite and is organized to support shared, student, driver, and admin experiences.

## Features

### Students

- Register and authenticate with a college email address
- Submit and review transport requests
- Make and view payment records
- Create and view a bus pass after approval and payment
- View the assigned bus, route, and pickup point through the assignment workflow

### Drivers

- View dashboard, assigned bus, route, pickup points, and students
- Verify a student's bus pass ID before attendance marking
- Mark attendance while preventing duplicate records
- Review today's attendance
- Submit and review bus-problem reports

### Administrators

- Manage buses, routes, and pickup points
- Assign drivers to buses and routes
- Review, approve, and reject transport requests
- Allocate students to buses and routes
- Review attendance records
- Review and update bus-problem report status

## Architecture

```text
React + Vite frontend
          |
          | HTTP / JSON REST API
          v
Node.js + Express backend
          |
          | Mongoose
          v
MongoDB (local instance or Atlas)
```

## Repository Structure

```text
Campus-Bus-Pass-Management-System/
├── backend/
│   ├── admin/
│   │   ├── controllers/
│   │   └── adminRoutes.js
│   ├── common/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── authRoutes.js
│   ├── database/models/
│   ├── driver/
│   │   ├── controllers/
│   │   └── driverRoutes.js
│   ├── student/
│   │   ├── controllers/
│   │   └── studentRoutes.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── admin/
│   ├── common/
│   ├── driver/
│   ├── student/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── docs/
└── README.md
```

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Email | Nodemailer |
| Development | Git, GitHub, VS Code, Postman |

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Configure environment variables

Create `.env` in the repository root, next to this README. The backend also supports a `.env` file inside `backend/`.

```env
MONGO_URI=mongodb://localhost:27017/campus-bus
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
PORT=5000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

`MONGODB_URI` can be used instead of `MONGO_URI`. Email variables are required for email-verification workflows.

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Run the backend

From the `backend/` directory:

```bash
npm run dev
```

For a normal start without file watching:

```bash
npm start
```

The API runs at `http://localhost:5000` by default. Its health endpoint is `GET /`.

### 4. Run the frontend

From the `frontend/` directory, in a separate terminal:

```bash
npm run dev
```

Vite prints the local development URL in the terminal, normally `http://localhost:5173`.

## API Reference

All routes below are mounted by `backend/server.js`. Protected routes require a JWT in the following header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Authentication: `/api/auth`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/test` | Public | Check that auth routes are available |
| POST | `/register` | Public | Register a user |
| GET | `/verify-email?token=...` | Public | Verify an email address |
| POST | `/login` | Public | Authenticate and receive a JWT |
| POST | `/reset-driver-password` | Public | Reset a driver's password |
| GET | `/me` | Authenticated | Return the current user |
| GET | `/student-only` | Student | Example student-only protected route |

### Student: `/api/student`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/passes` | Submit a transport request |
| GET | `/passes/my` | View the student's transport requests |
| POST | `/buspasses` | Create a bus pass after payment and approval |
| GET | `/buspasses/my` | View the student's bus pass |
| POST | `/payments` | Record a payment |
| GET | `/payments/my` | View the student's payment history |

### Driver: `/api/driver`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/dashboard` | View the driver dashboard |
| GET | `/bus` | View the assigned bus |
| GET | `/route` | View the assigned route |
| GET | `/route/pickup-points` | View route pickup points |
| GET | `/students` | View assigned students |
| POST | `/verify-bus-pass` | Verify a bus pass ID |
| POST | `/attendance` | Mark attendance |
| GET | `/attendance/today` | View today's attendance |
| POST | `/bus-problems` | Report a bus problem |
| GET | `/bus-problems` | View the driver's reports |

### Administrator: `/api/admin`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST, GET | `/buses` | Create and list buses |
| GET, PUT, DELETE | `/buses/:id` | Read, update, and delete a bus |
| PUT | `/buses/:id/driver` | Assign a driver to a bus |
| POST, GET | `/routes` | Create and list routes |
| GET, PUT, DELETE | `/routes/:id` | Read, update, and delete a route |
| PUT | `/routes/:id/driver` | Assign a driver to a route |
| POST, GET | `/pickup-points` | Create and list pickup points |
| GET | `/pickup-points/:id` | Read a pickup point |
| GET | `/transport-requests` | List transport requests |
| GET | `/transport-requests/pending` | List pending requests |
| PUT | `/transport-requests/:id/approve` | Approve a request |
| PUT | `/transport-requests/:id/reject` | Reject a request |
| POST | `/students/allocate` | Allocate a student to a bus and route |
| GET | `/attendance` | Review attendance |
| GET | `/bus-problems` | Review bus-problem reports |
| PUT | `/bus-problems/:id/status` | Update a problem's status |

All administrator endpoints require an authenticated user with the `admin` role. Student and driver endpoints similarly enforce their respective roles through the shared authorization middleware.

## Database Models

The backend currently contains these Mongoose models in `backend/database/models/`:

| Model | Responsibility |
| --- | --- |
| `User.js` | Shared authentication and role information |
| `Student.js` | Student profile and bus-pass information |
| `Driver.js` | Driver information and assignments |
| `Admin.js` | Administrator information |
| `Bus.js` | Bus details and capacity |
| `Route.js` | Route information and driver assignment |
| `PickupPoint.js` | Pickup-point information |
| `TransportRequest.js` | Student transport applications and status |
| `BusAssignment.js` | Student bus, route, and pickup-point allocation |
| `Attendance.js` | Attendance records |
| `BusProblem.js` | Bus-problem reports and status |

## Authentication and Authorization

The API uses JWT-based authentication and bcryptjs password hashing. After login, include the returned token as a Bearer token on protected requests. The `protect` middleware validates the token, and the `authorize` middleware limits access by role:

```text
student  -> student endpoints
driver   -> driver endpoints
admin    -> administrator endpoints
```

Never commit `.env` files, database credentials, JWT secrets, or email app passwords to source control.

## Development Checks

Run the frontend checks from `frontend/`:

```bash
npm run lint
npm run build
```

The backend currently does not define an automated test suite. JavaScript syntax can be checked from the repository root with:

```powershell
Get-ChildItem -Path backend -Filter *.js -Recurse | ForEach-Object { node --check $_.FullName }
```

## Documentation

Additional module documentation is available in the [`docs/`](docs/) directory, including backend and frontend notes for the administrator, driver, authentication, and student workflows.

## Project Status

The backend API and the React/Vite frontend foundation are in place. Role-specific frontend screens and service integrations can be developed within the existing `frontend/common`, `frontend/student`, `frontend/driver`, and `frontend/admin` module boundaries.
