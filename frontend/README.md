# Campus Bus Pass Management System — Frontend

Issue 1 provides the public landing page, student and driver registration, login, JWT session handling, protected role routes, and the common application shell. It uses React, Vite, React Router, Context, Axios, and CSS. Detailed student, driver, and admin features belong to their respective modules; the dashboard contains no invented operational data.

## Run locally

From the repository root, start the existing Express backend in one terminal:

```sh
cd backend
npm install
npm start
```

The backend requires its existing MongoDB connection setting (`MONGO_URI` or `MONGODB_URI`) and `JWT_SECRET` in `backend/.env`. The default backend port is `5000`. Keep backend secrets out of frontend files.

In another terminal:

```sh
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite. The shared Axios client defaults to `/api`; Vite proxies development requests to `http://localhost:5000`.

To use a different API server, create `frontend/.env.local` and restart Vite:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Include `/api` in the base URL. `VITE_` settings are public browser configuration. Production hosting must serve frontend routes through `index.html` and either proxy `/api` to Express or build with the appropriate `VITE_API_URL`.

## Authentication contract

The frontend uses the routes already mounted by the backend:

| Endpoint | Request / purpose |
| --- | --- |
| `POST /api/auth/signup` | `{ name, password, role, phone, ...roleFields }` |
| `POST /api/auth/login` | `{ email, password, role }` |
| `GET /api/auth/me` | Restore the authenticated user using `Authorization: Bearer <token>` |

Public registration supports student and driver only. Both forms send name, phone, password and role. Student role fields are collegeEmail, studentId (enrollment number) and department. Driver fields are email and licenseNumber. Confirm password stays in the browser. Passwords require at least eight characters and at most 72 UTF-8 bytes. Authentication directly uses the Student, Driver or Admin collection. See `../docs/BACKEND_AUTH_STUDENT.md` for the complete contract.

Registration returns the user to login with a success message. Login validates the selected role against the server response before saving the token. `AuthContext` owns login, logout, session restoration, and expiry; `api.js` attaches the token to protected requests and supplies safe error messages. Transient connection failures allow session recovery without discarding the saved token.

## Routes and module integration

| Route | Page |
| --- | --- |
| `/` | Public landing page |
| `/login` | Login; `?role=student`, `driver`, or `admin` preselects the role |
| `/register/student` | Student registration |
| `/register/driver` | Driver registration |
| `/dashboard` | Redirect to the signed-in user's dashboard |
| `/student/dashboard` | Student dashboard shell |
| `/driver/dashboard` | Driver dashboard shell |
| `/admin/dashboard` | Admin dashboard shell |
| `/unauthorized` | Access denied |
| Unmatched paths | Page not found |

There is no public admin registration page. Signed-out users are redirected to login; authenticated users requesting another role's routes receive the access-denied page.

`AppRoutes` is the route integration point. Add future module pages under the appropriate `RoleRoute` and reuse `AppLayout` for the sidebar, navbar, profile, and sign-out controls. Use `getDashboardPath(role)` for role destinations, `useAuth()` for the current account, and the shared Axios client for API calls. Keep backend authorization in place; frontend route guards control navigation and do not replace server checks.

## Checks

From `frontend/`:

```sh
node --test tests/auth-services.test.mjs
npm run lint
npm run build
```

The service tests cover the real request contract, token handling, session invalidation, and safe error mapping without needing a running database. Build output is written to `frontend/dist`.

From `backend/`, run the real HTTP and MongoDB integration checks:

```sh
node tests/nine-model-integration.cjs
```

The integration script reads the backend configuration, creates a uniquely named test database on that MongoDB server, starts Express on an available port, and removes only its own database when finished. The configured database account must permit creating and dropping that isolated test database. It covers student/driver registration, login for all three roles, session identity, invalid credentials and tokens, password hashing, and backend role restrictions.
