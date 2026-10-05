# Admin and Driver APIs

All endpoints use the common `{ success, message, data }` envelope. All routes below require a valid role-bearing JWT and the corresponding role. Collection prefixes stay singular.

## Admin

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/admin/students` | List safe student profiles. |
| PUT | `/api/admin/students/:id` | Update name, phone, department and semester. |
| GET | `/api/admin/drivers` | List safe driver profiles with bus/route. |
| PUT | `/api/admin/drivers/:id` | Update name, phone and active/inactive status. |
| GET, POST | `/api/admin/buses` | List/create buses. |
| GET, PUT, DELETE | `/api/admin/buses/:id` | Read/update/delete an unreferenced bus. |
| PUT | `/api/admin/buses/:id/driver` | `{ driverId, routeId? }`; atomically link driver, bus and optional route. |
| GET, POST | `/api/admin/routes` | List/create routes. |
| GET, PUT, DELETE | `/api/admin/routes/:id` | Read/update/delete an unreferenced route. |
| PUT | `/api/admin/routes/:id/driver` | `{ driverId }`; driver must already have a bus. |
| GET, POST | `/api/admin/pickup-points` | List/create pickup points. |
| GET, PUT, DELETE | `/api/admin/pickup-points/:id` | Read/update/delete an unreferenced pickup point and maintain its route reference. |
| GET | `/api/admin/transport-requests` | All requests; optional `status` query. |
| GET | `/api/admin/transport-requests/pending` | Pending requests. |
| PUT | `/api/admin/transport-requests/:id/approve` | Review pending request; records current Admin and time. |
| PUT | `/api/admin/transport-requests/:id/reject` | Requires `{ rejectionReason }`. |
| POST | `/api/admin/students/allocate` | Existing allocation endpoint: `{ studentId, busId, routeId, pickupPointId }`. Server generates busPassId. |
| GET | `/api/admin/assignments` | Assignments with related transport data. |
| GET | `/api/admin/attendance` | Attendance; optional `date=YYYY-MM-DD`. |

Bus creation requires busNumber, registrationNumber and positive integer capacity; busType defaults to university. Route creation requires routeName, routeCode, startPoint and endPoint; assignedBus is optional. Pickup creation uses existing `location` and `sequence` fields, plus name and route; pickupTime is optional HH:MM.

Allocation requires an approved request for the same student, route and pickup point. The selected bus must belong to the route. Capacity checks and pass sequencing run in a transaction. A unique active-student index prevents double assignment. Referenced history cannot be deleted via CRUD.

## Driver

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/driver/profile` | Own driver profile. |
| GET | `/api/driver/dashboard` | Actual assigned bus/route, student count and today's marked attendance. |
| GET | `/api/driver/bus` | Assigned bus, or null. |
| GET | `/api/driver/route` | Assigned route, or null. |
| GET | `/api/driver/route/pickup-points` | Stops on assigned route. |
| GET | `/api/driver/students` | Active assignments on the driver's bus and route. |
| POST | `/api/driver/verify-bus-pass` | `{ busPassId }`; returns matching active assignment with safe student details. |
| POST | `/api/driver/attendance` | `{ busPassId, status? }`; present/absent, default present. Only today's campus date is accepted. |
| GET | `/api/driver/attendance/today` | Attendance marked today by this driver. |

Pass verification requires both bus and route to match the authenticated driver. Attendance stores the direct Driver reference and has a unique student/date index. A repeated or concurrent duplicate returns 409.

See [DATABASE.md](DATABASE.md) for relationship and migration details. Test with `node backend/tests/nine-model-integration.cjs`.
