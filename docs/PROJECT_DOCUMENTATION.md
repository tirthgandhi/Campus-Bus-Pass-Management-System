# Campus Student Bus Pass Management System

## 1. Project Overview

The **Campus Student Bus Pass Management System** is a web-based application developed to manage student bus passes, students, drivers, buses, routes, and bus attendance in one system.

The system has three main users:

- Student
- Admin
- Driver

The main goal of the system is to reduce manual work and make bus pass management easier, faster, and more organized.

---

## 2. User Roles

### 2.1 Student

The Student can:

- Sign up using college email
- Login to the system
- Apply for a bus pass
- View bus pass request status
- View bus pass details
- View assigned bus
- View assigned route and timings
- View/manage profile

### 2.2 Admin

The Admin manages the complete system.

The Admin can:

- Manage students
- Verify students
- Approve or reject student requests
- Manage student bus passes
- Manage drivers
- Verify drivers
- Approve or reject driver requests
- Manage buses
- Manage routes
- Assign drivers to buses
- Assign students to buses/routes
- View daily reports
- View monthly reports
- View yearly reports

### 2.3 Driver

The Driver can:

- Sign up / Login
- Send a request to Admin
- Provide bus number
- View assigned bus
- View assigned route
- View route stops and timings
- View students on the assigned route
- Mark student bus attendance
- View today's attendance

---

## 3. System Workflow

### 3.1 Student Workflow

```text
Student Signup
      ↓
Login
      ↓
Apply for Bus Pass
      ↓
Send Request to Admin
      ↓
Admin Verifies Student
      ↓
Approve / Reject Request
      ↓
View Bus Pass
      ↓
View Assigned Bus & Route

###3.2 Driver Workflow

```text
Driver Signup
      ↓
Login
      ↓
Enter Driver Details & Bus Number
      ↓
Send Request to Admin
      ↓
Admin Verifies Driver
      ↓
Approve / Reject Request
      ↓
View Assigned Bus & Route
      ↓
View Students on Route
      ↓
Mark Student Attendance
```

###3.3 Admin Workflow

```text
Admin Login
      ↓
View Dashboard
      ↓
Manage Students
      ↓
Approve/Reject Student Requests
      ↓
Manage Drivers
      ↓
Approve/Reject Driver Requests
      ↓
Manage Buses
      ↓
Manage Routes
      ↓
Assign Buses to Drivers
      ↓
Assign Students to Buses/Routes
      ↓
View Reports (Daily, Monthly, Yearly)
      ↓
View Attendance Records
```

---

## 6. Main Modules

### Student Module

```text
Student Module
│
├── Registration
├── Login
├── Bus Pass Request
├── Request Status
├── Bus Pass Details
├── Assigned Bus
├── Assigned Route
└── Profile
```

### Admin Module

```text
Admin Module
│
├── Student Management
├── Student Verification
├── Driver Management
├── Driver Verification
├── Bus Management
├── Route Management
├── Bus Pass Management
├── Student & Driver Assignment
└── Reports
```

### Driver Module

```text
Driver Module
│
├── Registration / Login
├── Driver Request
├── Assigned Bus
├── Assigned Route
├── Route Stops & Timings
├── Students on Route
└── Attendance
```

---

## 7. Database Collections

MongoDB will be used to store the application data.

The main collections are:

```text
users
students
drivers
buses
routes
buspasses
attendance
```

### Users

Stores login and basic user information.

### Students

Stores student-related information and bus pass details.

### Drivers

Stores driver information and driver approval status.

### Buses

Stores bus number and bus-related information.

### Routes

Stores route details, stops, and timings.

### Bus Passes

Stores student bus pass requests and approval status.

### Attendance

Stores student bus attendance marked by the driver.

---

## 8. User Access

| Feature                     | Student | Admin | Driver |
| --------------------------- | :-----: | :---: | :----: |
| Sign Up / Login             |    ✅    |   ✅   |    ✅   |
| Apply for Bus Pass          |    ✅    |   ❌   |    ❌   |
| View Bus Pass               |    ✅    |   ✅   |    ❌   |
| Manage Students             |    ❌    |   ✅   |    ❌   |
| Verify Students             |    ❌    |   ✅   |    ❌   |
| Manage Drivers              |    ❌    |   ✅   |    ❌   |
| Verify Drivers              |    ❌    |   ✅   |    ❌   |
| Manage Buses                |    ❌    |   ✅   |    ❌   |
| Manage Routes               |    ❌    |   ✅   |    ❌   |
| Manage Bus Passes           |    ❌    |   ✅   |    ❌   |
| Assign Student to Bus/Route |    ❌    |   ✅   |    ❌   |
| Assign Driver to Bus        |    ❌    |   ✅   |    ❌   |
| View Assigned Bus           |    ✅    |   ✅   |    ✅   |
| View Assigned Route         |    ✅    |   ✅   |    ✅   |
| View Students on Route      |    ❌    |   ✅   |    ✅   |
| Mark Attendance             |    ❌    |   ❌   |    ✅   |
| View Today's Attendance     |    ❌    |   ❌   |    ✅   |
| View Daily Reports          |    ❌    |   ✅   |    ❌   |
| View Monthly Reports        |    ❌    |   ✅   |    ❌   |
| View Yearly Reports         |    ❌    |   ✅   |    ❌   |

---

## 9. Team Work Distribution

The project is developed by four team members.

### Frontend Team

#### Frontend Member 1

Responsible for the Student module:

* Student registration
* Student login
* Student dashboard
* Bus pass request
* Bus pass status
* Bus pass details
* Assigned bus
* Assigned route
* Student profile

#### Frontend Member 2

Responsible for Admin and Driver interfaces.

**Admin:**

* Admin dashboard
* Student management
* Driver management
* Bus management
* Route management
* Bus pass management
* Assignments
* Reports

**Driver:**

* Driver registration
* Driver login
* Driver dashboard
* Driver request
* Assigned bus
* Assigned route
* Students on route
* Attendance

### Backend Team

#### Backend Member 1

Responsible for authentication and Student-related backend:

* Node.js / Express setup
* MongoDB connection
* Authentication APIs
* Student registration API
* Student login API
* Student profile API
* Bus pass request API
* Bus pass status API
* Student bus and route APIs

#### Backend Member 2

Responsible for Admin and Driver backend.

**Admin APIs:**

* Student management
* Student verification
* Driver management
* Driver verification
* Bus management
* Route management
* Bus pass management
* Student/bus/route assignment
* Driver/bus assignment
* Daily reports
* Monthly reports
* Yearly reports

**Driver APIs:**

* Driver registration
* Driver request
* Assigned bus API
* Assigned route API
* Students on route API
* Attendance API

---

## 10. Git and GitHub Workflow

Each team member should work on a separate branch instead of directly working on the `main` branch.

### Branch Structure

```text
main
│
├── frontend-student
├── frontend-admin-driver
├── backend-auth-student
└── backend-admin-driver
```

### Basic Workflow

```text
Create Branch
      ↓
Write / Update Code
      ↓
Test the Code
      ↓
git add .
      ↓
git commit
      ↓
git push
      ↓
Create Pull Request
      ↓
Review
      ↓
Merge into main
```

### Important Rules

* Do not directly push unfinished code to `main`.
* Pull the latest changes before starting work.
* Use meaningful commit messages.
* Test your changes before creating a Pull Request.
* Do not modify another member's module without discussing it first.
* Keep frontend and backend changes organized.

---

## 11. Project Objectives

The main objectives of the system are:

* To provide an online bus pass application system.
* To reduce manual paperwork.
* To make student verification easier.
* To manage drivers in one system.
* To manage buses and routes efficiently.
* To assign students and drivers to buses and routes.
* To allow drivers to mark student bus attendance.
* To provide daily, monthly, and yearly reports.
* To keep bus transportation information organized.

---

## 12. Future Scope

The system can be extended in the future with:

* Online bus pass payment
* Online bus pass renewal
* Email notifications
* SMS notifications
* Mobile application
* Online route map
* Advanced report generation
* Digital bus pass