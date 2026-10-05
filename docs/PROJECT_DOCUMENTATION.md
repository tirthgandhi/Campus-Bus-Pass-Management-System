# Project architecture

The Campus Bus Pass Management System connects students, drivers and campus administrators. The React frontend uses a shared authentication context, one Axios client, protected role routes and a reusable layout. Express enforces JWT authentication and role authorization for every operational endpoint.

## Nine-model database

1. Student — authentication and profile.
2. Driver — authentication, profile, bus and route references.
3. Admin — authentication and privileged identity.
4. Bus — fleet record and assigned driver.
5. Route — route details and pickup-point references.
6. PickupPoint — a stop belonging to a route.
7. TransportRequest — student request reviewed by an Admin.
8. BusAssignment — final student/bus/route/stop relationship and permanent pass ID.
9. Attendance — a student/day record marked by a Driver for a Bus and Route.

The complete ER diagram, field names, invariants and existing-data upgrade checklist are in [DATABASE.md](DATABASE.md).

## Connected workflow

Student registers and signs in → selects pickup point → submits request → administrator reviews → administrator assigns transport → student reads pass and assignment → assigned driver verifies pass → driver records today's attendance.

Requests may be rejected with a reason. Assignments require approval, matching route/stop relationships and available capacity. Concurrent duplicate attendance is blocked by a database unique index.

## Frontend boundaries

The common module contains the public landing page, login, student/driver registration, authenticated shell, profile display, logout, loaders and error pages. Role dashboards are intentionally simple shells. Detailed Student, Driver and Admin screens are future module integrations and must use actual server data.

- [Frontend setup](../frontend/README.md)
- [Student frontend integration](FRONTEND_STUDENT.md)
- [Admin and Driver frontend integration](FRONTEND_ADMIN_DRIVER.md)
- [Authentication and Student APIs](BACKEND_AUTH_STUDENT.md)
- [Admin and Driver APIs](BACKEND_ADMIN_DRIVER.md)

## Development rules

Continue the existing repository and module directories. Use the shared Axios client and Context; do not add another framework, authentication provider or state library. Preserve Git history, work on team branches and review shared contract changes before integration. Never commit `.env` or return credentials, database connection strings or stack traces.

Transactions require an Atlas deployment or replica set. API tests use a disposable database and preserve existing data. See the root README for setup and verification commands.
