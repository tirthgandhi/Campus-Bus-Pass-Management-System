# Campus Bus Pass Management System

A MERN university transportation project using React, Vite, JavaScript, CSS, Axios, React Router, Context, Express, MongoDB, Mongoose, JWT and bcryptjs.

The common frontend includes a public landing page, student and driver registration, role-based login, persistent sessions, protected dashboard shells, profile details, responsive navigation, and sign-out confirmation. Operational APIs support transport requests, assignments and attendance. Detailed role-specific frontend pages remain separate module work; the common dashboard does not invent operational data.

## Run locally

1. Install the existing dependencies in `backend/` and `frontend/` with `npm ci`.
2. Configure `backend/.env` from the root `.env.example`. Set `MONGO_URI` (or `MONGODB_URI`) and a strong `JWT_SECRET`.
3. Run `npm start` in `backend/` (default port 5000).
4. Run `npm run dev` in `frontend/` and open the Vite URL.

The frontend uses `/api` with a Vite development proxy to port 5000. For a separate API origin, set `VITE_API_URL` in `frontend/.env.local` before starting/building. Production hosting needs an SPA fallback and an API reverse proxy or configured API base URL. Never put backend secrets in `VITE_` settings.

MongoDB must support transactions (Atlas or a replica set). Transactions protect assignment capacity, driver/bus relationships, request reviews and pickup-point relationships.

## Database: exactly 9 models

| Model | Collection | Responsibility |
| --- | --- | --- |
| Student | students | Student authentication and profile |
| Driver | drivers | Driver authentication, profile and transport references |
| Admin | admins | Privileged authentication and account details |
| Bus | buses | Fleet, capacity and assigned driver |
| Route | routes | Transport route, bus, driver and ordered pickup points |
| PickupPoint | pickuppoints | Route stop and pickup time |
| TransportRequest | transportrequests | Student request and administrator review |
| BusAssignment | busassignments | Student's transport assignment and permanent pass ID |
| Attendance | attendances | Driver-marked student attendance per campus calendar day |

See [database relationships and upgrade notes](docs/DATABASE.md) and [project architecture](docs/PROJECT_DOCUMENTATION.md).

## Authentication

Student, Driver and Admin authenticate directly against their respective collections. Passwords are bcrypt hashes, excluded from queries by default and stripped from JSON responses. JWTs contain `{ id, role }`; middleware verifies the signature, loads that role's account and applies server authorization.

| API | Payload |
| --- | --- |
| `POST /api/auth/signup` — student | `role`, `name`, `collegeEmail`, `studentId`, `phone`, `department`, `password`; optional `semester` |
| `POST /api/auth/signup` — driver | `role`, `name`, `email`, `phone`, `licenseNumber`, `password` |
| `POST /api/auth/login` | `email`, `password`, `role` |
| `GET /api/auth/me` | Bearer token |

`studentId` preserves the existing enrollment field; `collegeEmail` is the student login address. Student signup also accepts `email` as an input alias. Signup and login preserve the response envelope: `{ success, message, data: { _id, name, email, role, token } }`. `/me` returns the same identity without a token. Public signup cannot create an administrator.

To provision an admin explicitly, supply `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and optionally `ADMIN_PHONE` in the process environment, then run `node backend/scripts/create-admin.js`. The script refuses an existing email and does not print credentials.

The existing optional email-verification endpoints remain: `/api/auth/register`, `/verify-email?role=student|driver&token=...`, and `/login-verified`. They require email service configuration. The normal signup/login flow does not require email delivery. Driver password reset is restricted to authenticated admins.

## Workflow and existing API names

1. Student selects an active pickup point and submits `POST /api/student/passes` with `{ pickupPoint }`.
2. Admin approves or rejects `/api/admin/transport-requests/:id/approve|reject`.
3. Admin assigns an available bus/route/stop through the existing `POST /api/admin/students/allocate` endpoint. Payload: `{ studentId, busId, routeId, pickupPointId }`.
4. The server generates and stores a permanent pass such as `GSFC-01-001` on BusAssignment. Duplicate active assignments and full buses are rejected.
5. Student views `GET /api/student/buspasses/my`.
6. The assigned driver verifies a pass with `POST /api/driver/verify-bus-pass`, then records attendance through `/api/driver/attendance`.

Attendance dates use the Asia/Kolkata calendar day stored as UTC midnight. A unique `{ student, date }` index blocks duplicate attendance even under concurrent submissions. Drivers can mark only today's attendance for their assigned bus and route.

Endpoint references: [authentication/student](docs/BACKEND_AUTH_STUDENT.md), [admin/driver](docs/BACKEND_ADMIN_DRIVER.md). Endpoint prefixes remain singular (`/api/student`, `/api/driver`); no competing plural routes were added.

## Verification

```sh
node --test frontend/tests/auth-services.test.mjs
node backend/tests/nine-model-integration.cjs
```

Run `npm run lint` and `npm run build` from `frontend/`. The API suite creates a uniquely named disposable database, runs real HTTP and persistence assertions, and deletes only that database in cleanup. Its MongoDB credential needs permission to create and drop test databases. The earlier test entry points forward to this suite. `--serve` keeps the isolated backend on port 5000 for browser tests; stop it with a local `POST /__test/shutdown` request. This shutdown endpoint exists only in the test harness.

For existing installations, follow the manual upgrade checklist in `docs/DATABASE.md` before release. Existing production documents and obsolete collections are not automatically modified or deleted. Tokens issued under the previous authentication design require signing in again.

## Project layout and team boundaries

- `backend/database/models/`: the nine models listed above.
- `backend/common/`: authentication, authorization, shared validation and assignment transactions.
- `backend/student/`, `driver/`, `admin/`: existing module routes/controllers.
- `frontend/src/common/`: common pages, services, routes, components and authentication context.
- `frontend/student/`, `driver/`, `admin/`: preserved module directories.

| Module | Existing team branch |
| --- | --- |
| Common / Authentication | `feature/common-auth` |
| Driver | `feature/driver` |
| Student | `feature/student` |
| Admin / Facility | `feature/admin` |

Coordinate changes to model fields, response envelopes and route names. Preserve shared authorization and avoid duplicate models or API clients. Use pull requests for integration and keep credentials out of Git.

This project is intended for academic and educational use. Payments, QR/RFID, tracking, biometrics, chat and transfer/replacement workflows are outside its scope.
