# Backend Member 2: Admin + Driver (BACKEND_ADMIN_DRIVER.md)

## 1. Developer Role
This developer is responsible for implementing all backend logic, database models, and REST APIs for the Admin and Driver modules.

## 2. Backend Structure
Work within the existing structure established by Backend Member 1:
- `models/`: Add Driver, Bus, Route, Attendance.
- `controllers/`: Add Admin and Driver controllers.
- `routes/`: Add admin and driver routes.
- `middleware/`: Add Admin and Driver specific auth checks.

## 3. MongoDB Models
Design Mongoose schemas for:
- Driver
- Bus
- Route
- Attendance
(Coordinate with Backend Member 1 to ensure relationships with Student and BusPass are properly handled without duplicating data.)

## 4. Admin APIs
Implement APIs for the Admin to:
- **Student Management**: View, verify, approve, reject students.
- **Driver Management**: View requests, verify, approve, reject drivers.
- **Bus Management**: CRUD operations for buses.
- **Route Management**: CRUD operations for routes (including stops and timings).
- **Bus Pass Management**: View requests, approve, reject, update status.
- **Assignments**: Assign Student to Bus/Route, Assign Driver to Bus. Ensure validation (e.g., student/driver must be approved, bus must exist).

## 5. Driver APIs
Implement APIs for the Driver:
- Registration & Login (Driver Request workflow).
- View assigned bus and route.
- View students on assigned route.

**Driver Approval Workflow**:
Driver Registration → Driver Request → Admin Verification → Approve/Reject → Driver Login/Access.

## 6. Attendance APIs
- Get list of students assigned to the driver's route.
- Submit daily attendance (Present/Absent).
- View today's attendance for the route.
- *Note: Students and Admins do not manage or view daily attendance directly in their primary dashboard views, though Admin reports may aggregate this.*

## 7. Reports
Develop API endpoints for Admin reporting:
- Daily, Monthly, and Yearly reports aggregating data (e.g., attendance stats, bus pass approvals).
- Utilize MongoDB aggregation pipelines for efficient data querying.

## 8. Authorization & Security
- Implement middleware to restrict routes (e.g., `isAdmin`, `isDriver`).
- Ensure drivers can only submit attendance for their assigned route.
- Validate all inputs.
- Use proper HTTP status codes.

## 9. Testing
Create Postman collections to thoroughly test:
- Admin CRUD operations on buses and routes.
- Admin assignments.
- Driver login and attendance submission.
- Report data generation.

## 10. Git Branch
- Use branch: `backend-admin-driver`
- Follow PR workflow.

## 11. Frontend Coordination
Provide Frontend Member 2 with the exact API contracts (Endpoints, Methods, Request Body shapes, JSON responses).

## 12. Completion Checklist
- [ ] Admin APIs for CRUD and assignments implemented.
- [ ] Driver APIs for dashboard and attendance implemented.
- [ ] Report generation APIs functional.
- [ ] Authorization middleware correctly restricting access.
- [ ] API documentation shared with frontend team.
- [ ] Ready for Pull Request.
