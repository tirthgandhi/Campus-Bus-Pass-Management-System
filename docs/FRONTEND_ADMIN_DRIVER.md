# Frontend Member 2: Admin + Driver (FRONTEND_ADMIN_DRIVER.md)

## 1. Developer Role
This developer is responsible for creating all Admin-side and Driver-side React interfaces for the Campus Student Bus Pass Management System.

## 2. Admin Features
The Admin frontend must include:
- Admin Login
- Admin Dashboard
- Student Management
- Student Verification
- Approve/Reject Student
- Driver Management
- Driver Verification
- Approve/Reject Driver
- Bus Management
- Route Management
- Bus Pass Management
- Assign Driver to Bus
- Assign Student to Bus/Route
- Daily Reports
- Monthly Reports
- Yearly Reports
- Admin Profile
- Logout

## 3. Driver Features
The Driver frontend must include:
- Driver Registration
- Driver Login
- Driver Request
- Driver Dashboard
- Provide Bus Number
- View Assigned Bus
- View Assigned Route
- View Route Stops and Timings
- View Students on Route
- Mark Student Attendance
- View Today's Attendance
- Driver Profile
- Logout

## 4. Explain Every Page

### Admin Pages
- **Admin Dashboard**: Overview cards (Total Students, Pending Requests, Active Passes, Total Buses/Routes).
- **Student Management**: Table of students, search bar, view details, verify/approve/reject buttons.
- **Driver Management**: Table of drivers, verification status, approve/reject requests.
- **Bus & Route Management**: CRUD interfaces (Add/Edit/Delete). Forms for bus capacity, number, and route stops/timings.
- **Bus Pass Management**: List of pass requests, approve/reject actions.
- **Assignments**: Modals or forms to map Student->Bus/Route and Driver->Bus.
- **Reports**: Tables and charts for Daily, Monthly, Yearly attendance and pass data.

### Driver Pages
- **Registration/Login**: Standard forms for drivers.
- **Driver Dashboard**: Shows Driver Name, Assigned Bus Number, Assigned Route, Route Timing, Total Students, and Today's Attendance Status.
- **Assigned Route & Students**: Table of students assigned to the driver's route.
- **Attendance**: Interface to mark students Present/Absent for the day.

## 5. Driver Attendance
- Select/view assigned route.
- Display a list of students on that route.
- Toggles/checkboxes to mark Present/Absent.
- Save attendance button (triggers API).
- View today's attendance summary.
- *Note: Do not allow Driver to modify students, buses, or routes.*

## 6. React Folder Structure
```text
src/
├── components/   # Reusable UI (tables, modals, buttons)
├── pages/
│   ├── admin/    # Admin specific views (Dashboard, ManageStudents, etc.)
│   └── driver/   # Driver specific views (Dashboard, Attendance, etc.)
├── services/     # API functions for Admin and Driver
├── hooks/        # Auth hooks, data fetching hooks
├── utils/        # Formatters, constants
├── assets/       # CSS, images
├── App.jsx       # Routing
└── main.jsx      # Entry
```

## 7. API Integration
Expected API categories to coordinate with Backend Member 2:
- Admin APIs
- Driver APIs
- Student management APIs
- Bus APIs
- Route APIs
- Bus pass APIs
- Assignment APIs
- Report APIs
- Attendance APIs

## 8. Authentication and Authorization
- Admin can access Admin pages only.
- Driver can access Driver pages only.
- Student cannot access Admin/Driver pages.
- Unauthenticated users go to Login.

## 9. UI/UX
- Responsive design.
- Reusable components (e.g., standard data table, modal dialog).
- Status badges (e.g., Green for Approved, Yellow for Pending).
- Confirmation dialogs before destructive actions (e.g., deleting a route).
- Proper loading spinners and error state messages.

## 10. Git Branch
- Use branch: `frontend-admin-driver`
- Follow standard PR process (pull, checkout, commit, push, create PR).

## 11. Backend Coordination
Coordinate with Backend Member 2 for:
- Endpoints, methods, request bodies, response formats, auth requirements, and error codes.

## 12. Testing Checklist
**Admin Checklist:**
- [ ] Login works.
- [ ] Dashboard stats load correctly.
- [ ] Can view and approve/reject students.
- [ ] Can perform CRUD on Buses and Routes.
- [ ] Can assign students/drivers.
- [ ] Reports render correctly.

**Driver Checklist:**
- [ ] Registration and Login works.
- [ ] Dashboard loads assigned data.
- [ ] Can view students on route.
- [ ] Can submit attendance successfully.

## 13. Completion Checklist
- [ ] Admin and Driver flows completed.
- [ ] Role-based route protection implemented.
- [ ] API integration fully tested.
- [ ] Ready for Pull Request.
