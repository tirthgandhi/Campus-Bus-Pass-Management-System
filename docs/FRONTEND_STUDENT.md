# Frontend Member 1: Student Module (FRONTEND_STUDENT.md)

## 1. Developer Role
This developer is responsible for designing and developing the complete Student-side frontend of the Campus Student Bus Pass Management System. This includes all user interfaces and interactions that a student will see and use.

## 2. Technologies to Use
- **React.js**: Core library for building the UI components.
- **JavaScript**: For frontend logic.
- **HTML/JSX**: For structuring the React components.
- **CSS**: Plain CSS for styling (do not use Bootstrap unless specifically required).
- **React Router**: For client-side routing and navigation.
- **Fetch API or Axios**: For making HTTP requests to the backend APIs.
- **Git/GitHub**: For version control.

*Note: Do not use unnecessary libraries.*

## 3. Student Features
The Student frontend must contain:
- Student Registration using college email
- Student Login
- Student Dashboard
- Apply for Bus Pass
- View Bus Pass Request Status
- View Bus Pass Details
- View Assigned Bus
- View Assigned Route and Timings
- Student Profile
- Logout

*Important: Students must NOT have an attendance page or attendance feature.*

## 4. Explain Each Page in Detail

### Student Registration
- **Purpose**: Allow new students to register for the system.
- **UI Elements**: A clean form.
- **Form Fields**: Full Name, College Email, Enrollment/Roll Number, Phone Number, Password, Confirm Password.
- **Buttons**: Register button, Link to Login page.
- **Validation**: Ensure college email domain matches requirements. Check password length and match. Verify all fields are filled.
- **API**: `POST /api/auth/student/register`
- **Expected Response**: Success message or validation error.
- **On Success**: Show success message and redirect to Login.
- **On Failure**: Display error message above the form.

### Student Login
- **Purpose**: Authenticate students.
- **UI Elements**: Login form.
- **Form Fields**: College Email, Password.
- **Buttons**: Login button, Link to Registration page.
- **Validation**: Ensure valid email format and password entered.
- **API**: `POST /api/auth/student/login`
- **Expected Response**: JWT Token and user basic info.
- **On Success**: Store token, redirect to Dashboard.
- **On Failure**: Show invalid credentials error.

### Student Dashboard
- **Purpose**: Main landing page after login showing an overview.
- **UI Elements**: Welcome message, status cards, quick links.
- **Displayed Data**:
  - Student name
  - Bus pass status (Pending/Approved/Rejected/Not Applied)
  - Bus pass ID if approved
  - Assigned bus
  - Assigned route
  - Route timing
  - Quick navigation cards/buttons (Apply, Profile, etc.)

### Bus Pass Request
- **Purpose**: Let students apply for a new bus pass.
- **UI Elements**: Application form.
- **Form Fields**: Pickup Stop, Route Preference, Term duration.
- **Buttons**: Submit button.
- **Validation**: Ensure no pending active pass exists.
- **API**: `POST /api/student/bus-pass`
- **Expected Response**: Request created confirmation.
- **State**: Show loading state during submission.
- **On Success**: Show success message and redirect to status page.
- **On Failure**: Show error message.

### Bus Pass Details & Status
- **Purpose**: Show the current status or details of the approved pass.
- **UI Elements**: Status badge (Pending/Approved/Rejected), Digital Pass Card (if approved).

### Assigned Bus & Route
- **Purpose**: Show transport details.
- **UI Elements**: Cards showing Bus Number, Driver Name, Route Details, Timings.

### Student Profile
- **Purpose**: View and edit personal details.
- **UI Elements**: Profile form (some fields disabled like email/roll no).
- **API**: `GET /api/student/profile` & `PUT /api/student/profile`.

## 5. Student Navigation
Recommended sidebar/navbar layout:
- Dashboard
- Apply for Bus Pass
- My Bus Pass
- My Bus & Route
- Profile
- Logout

## 6. React Project Structure
```text
src/
├── components/   # Reusable UI components (buttons, inputs, cards)
├── pages/        # Main page views
│   └── student/  # Student-specific pages (Dashboard, Login, etc.)
├── services/     # API call functions (Axios/Fetch logic)
├── hooks/        # Custom React hooks (e.g., useAuth)
├── utils/        # Helper functions, constants, validation logic
├── assets/       # Images, icons, CSS files
├── App.jsx       # Main routing setup
└── main.jsx      # React entry point
```

## 7. API Integration
The frontend will communicate with the backend using REST APIs. Example endpoints to expect:
- `POST /api/auth/student/register`
- `POST /api/auth/student/login`
- `POST /api/student/bus-pass`
- `GET /api/student/bus-pass/status`
- `GET /api/student/bus-pass`
- `GET /api/student/bus`
- `GET /api/student/route`
- `GET /api/student/profile`
- `PUT /api/student/profile`

*Note: Exact endpoints must be agreed with the backend team before implementation.*

## 8. Authentication
- Store the JWT safely (e.g., in localStorage or secure cookies) upon successful login.
- Protect Student routes using a PrivateRoute component.
- Redirect unauthenticated users to the Login page.
- Prevent Student users from accessing Admin or Driver pages (backend will reject, but frontend should not show links).

## 9. UI/UX Requirements
- Clean, simple, and responsive design.
- Easy to understand and navigate.
- Suitable for a university bus system (professional yet accessible).
- Use reusable React components to maintain consistency.

## 10. Validation
- **College Email**: Must end with the specific college domain.
- **Required Fields**: Show inline error messages if empty.
- **Phone Number**: 10-digit validation.
- **Password**: Minimum length, alphanumeric.
- **Confirm Password**: Must match the Password field exactly.

## 11. Testing Checklist
- [ ] Registration with valid and invalid data.
- [ ] Login with valid and invalid credentials.
- [ ] Dashboard displays correct overview data based on student state.
- [ ] Bus pass request submission.
- [ ] Viewing assigned bus and route.
- [ ] Profile updating.
- [ ] Logout clears authentication state.
- [ ] Protected routes block unauthorized access.

## 12. Git Branch
- Use branch: `frontend-student`
- Workflow:
  ```bash
  git pull origin main
  git checkout -b frontend-student
  git add .
  git commit -m "feat: added student dashboard"
  git push origin frontend-student
  ```
- *Do not directly push unfinished work to main.*

## 13. Connection With Backend Team
Coordinate with Backend Member 1 to get:
- API endpoints
- HTTP methods
- Request body formats
- Response JSON structure
- Error formats
- Authentication headers approach

## 14. Completion Checklist
- [ ] All student pages are implemented.
- [ ] Authentication works and routes are protected.
- [ ] Forms are fully validated.
- [ ] API integration is complete and tested against the backend.
- [ ] UI is responsive and clean.
- [ ] Code is pushed to `frontend-student` branch.
- [ ] Ready for Pull Request.
