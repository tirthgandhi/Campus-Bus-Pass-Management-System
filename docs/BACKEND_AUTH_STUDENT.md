# Backend Member 1: Authentication + Student (BACKEND_AUTH_STUDENT.md)

## 1. Developer Role
This developer is responsible for the foundational backend setup, database connections, all authentication logic, and the APIs related to the Student module.

## 2. Backend Setup
- **Node.js**: Project initialization (`npm init`).
- **Express.js**: Setup the main server.
- **Environment variables**: Use `dotenv` for PORT, DB_URI, JWT_SECRET, etc.
- **MongoDB connection**: Establish connection using Mongoose.
- **Middleware**: Setup CORS, JSON parsing, error handling.

## 3. Backend Folder Structure
```text
backend/
├── config/       # DB connection, env config
├── models/       # Mongoose schemas
├── controllers/  # Route handler logic
├── routes/       # Express routes
├── middleware/   # Auth checks, error handlers
├── utils/        # Helpers (e.g., hashing, token generation)
├── .env          # Secrets
├── server.js     # Main entry
└── package.json
```

## 4. MongoDB
Design and implement Mongoose models for:
- User (or separate Auth collections depending on team decision)
- Student
- BusPass

## 5. Authentication
Implement JWT-based authentication:
- Student registration & login.
- Password hashing using `bcrypt`.
- Role-based authorization middleware (e.g., verifyToken, checkRole).
- Do not store plain-text passwords.

## 6. Student Registration & Login
- **Registration**: Validate required fields (Full name, College email, Enrollment/Roll number, Phone number, Password). Validate college email format. Check for duplicates.
- **Login**: Validate credentials, compare hashed password, return JWT token and user info.

## 7. Student APIs
- **Profile APIs**: `GET /api/student/profile`, `PUT /api/student/profile`
- **Bus Pass APIs**:
  - `POST /api/student/bus-pass` (Submit request)
  - `GET /api/student/bus-pass/status` (View status)
  - `GET /api/student/bus-pass` (View details)
- **Transport APIs**:
  - `GET /api/student/bus` (Assigned bus)
  - `GET /api/student/route` (Assigned route)

*Students should only be able to query their own data.*

## 8. Security & Error Handling
- Use standard HTTP status codes (400, 401, 403, 404, 500).
- Hash passwords. Use secure JWT secrets.
- Validate incoming request body data.
- Never expose database credentials in Git.

## 9. Testing
Use Postman or similar tools to test:
- Successful and failed registration.
- Successful and failed login (wrong password, missing email).
- Accessing protected profile routes with and without tokens.
- Submitting bus pass requests.
- Fetching assigned bus/route data.

## 10. Git Branch
- Use branch: `backend-auth-student`
- Commit and push to this branch, then open a Pull Request.

## 11. Frontend Coordination
Provide Frontend Member 1 with the exact API contracts (Endpoint, Method, Auth Header, Request Body, Response JSON, Error formats).

## 12. Completion Checklist
- [ ] Server and DB connection setup.
- [ ] Models created.
- [ ] Auth middleware functioning.
- [ ] Registration and Login APIs tested.
- [ ] Student Profile and Bus Pass APIs tested.
- [ ] Code pushed and PR created.
