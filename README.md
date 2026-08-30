# Campus Student Bus Pass Management System

## 📌 Project Overview

The **Campus Student Bus Pass Management System** is a web-based application designed to manage student bus passes, drivers, buses, routes, and student bus attendance in one system.

The system has three main users:

- 🎓 Student
- 👨‍💼 Admin
- 🚌 Driver

The main purpose of this system is to reduce manual work and make bus pass management easier, faster, and more organized.

---

## 👥 Users and Functions

### 🎓 Student

Students can:

- Sign up using their college email
- Login to the system
- Apply for a bus pass
- View bus pass request status
- View bus pass details
- View assigned bus
- View assigned route and timings
- Manage/View their profile

---

### 👨‍💼 Admin

Admin manages the complete system.

Admin can:

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

---

### 🚌 Driver

Drivers can:

- Sign up / Login
- Send a request to Admin
- Provide bus number
- View assigned bus
- View assigned route
- View route stops and timings
- View students on their route
- Mark student bus attendance
- View today's attendance

---

## 🔄 System Workflow

### 🎓 Student Workflow

```text
Student Signup
      ↓
Login
      ↓
Apply for Bus Pass
      ↓
Send Request to Admin
      ↓
Admin Verifies Request
      ↓
Approve / Reject
      ↓
View Bus Pass
      ↓
View Assigned Bus & Route


### 🚌 Driver

Driver Signup
      ↓
Login
      ↓
Enter Driver Details & Bus Number
      ↓
Send Request to Admin
      ↓
Admin Verifies Request
      ↓
Approve / Reject
      ↓
View Assigned Bus & Route
      ↓
View Students on Route
      ↓
Mark Student Attendance

### 👨‍💼 Admin Workflow

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