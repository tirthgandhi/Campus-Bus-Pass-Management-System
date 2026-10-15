# Authentication and Student APIs

Base prefixes remain `/api/auth` and `/api/student`. Responses consistently use `{ success, message, data }`; errors use `{ success: false, message }`. Protected calls require `Authorization: Bearer <token>`.

## Authentication

| Method | Path | Input / behavior |
| --- | --- | --- |
| POST | `/api/auth/signup` | Student: `role`, `name`, `studentId`, `collegeEmail`, `phone`, `department`, `password`; optional `semester`. Driver: `role`, `name`, `email`, `phone`, `licenseNumber`, `password`. |
| POST | `/api/auth/login` | `email`, `password`, `role`; queries the selected role collection. |
| GET | `/api/auth/me` | Safe current identity from the JWT account and role. |
| POST | `/api/auth/register` | Same registration fields; sends an email-verification link. |
| GET | `/api/auth/verify-email` | `role` and `token` query parameters. |
| POST | `/api/auth/login-verified` | Same login fields; additionally enforces email verification for student/driver. |
| POST | `/api/auth/reset-driver-password` | **Admin only**; `email`, `newPassword`. |
| GET | `/api/auth/test` | Health check. |
| GET | `/api/auth/student-only`, `/driver-only`, `/admin-only` | JWT and corresponding role required. |

Signup and login return `data: { _id, name, email, role, token }`; `/me` omits token. Student login uses collegeEmail through the common `email` request field. Public registration never creates an admin. Logout clears the frontend session; there is no logout API.

### Legacy driver account migration

Driver accounts created before the direct-account authentication change stored their password hash on a linked `User` record. The current login reads credentials from `Driver`, so those records need migration. Back up the configured database before proceeding. From `backend/`, run `npm run migrate:legacy-drivers` to review a read-only dry-run summary. If the eligible/skipped counts are as expected, run `npm run migrate:legacy-drivers -- --apply` to copy eligible driver details and the existing bcrypt hash into each existing driver record. The script does not print password hashes, reset passwords, delete legacy users, or write during dry-run. Records with missing/invalid credentials, contact details, or duplicate email/license values are skipped and need administrator review.

## Student module

All endpoints below require the student role. Identity is always taken from the verified JWT.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/student/profile` | Own Student document without credentials. |
| PUT | `/api/student/profile` | Update `name`, `phone`, `department`, optional `semester`; cannot edit role, password, enrollment, account status or assignments. |
| GET | `/api/student/pickup-points` | Active pickup points on active routes. |
| POST | `/api/student/passes` | `{ pickupPoint }`; server derives route, sets student and pending status. |
| GET | `/api/student/passes/my` | Own request history with review status and rejection reason. |
| GET | `/api/student/buspasses/my` | Own active BusAssignment with bus, route, stop and permanent busPassId; `null` before assignment. |
| GET | `/api/student/attendance` | Own attendance records. |

The existing pass-request and bus-pass read URLs are preserved. Students cannot create their own assignments. A pending/approved request blocks another request; rejection permits resubmission.

## Validation and tests

Validate required fields, email, phone, password length, identifiers and enums at the API/schema boundaries. Never forward raw database exceptions. Passwords are excluded from populated documents as well as account responses. Run `node backend/tests/nine-model-integration.cjs` from the repository root for real API and persistence checks.
