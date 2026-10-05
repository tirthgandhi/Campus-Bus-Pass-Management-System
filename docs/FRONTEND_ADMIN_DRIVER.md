# Admin and Driver frontend integration

The common frontend supplies role login, driver registration, JWT handling, role-protected dashboard shells, profile details, responsive navigation and logout. Preserve these components. Add detailed module pages only within the existing AppLayout and corresponding RoleRoute.

Driver registration sends name, email, phone, licenseNumber and password with role=driver. Administrator accounts are provisioned through the explicit backend seed command; there is no public administrator registration.

Use the single Axios client in `frontend/src/common/services/api.js`. The actual endpoints and payloads are in [BACKEND_ADMIN_DRIVER.md](BACKEND_ADMIN_DRIVER.md).

Driver module pages can consume assigned bus, assigned route/stops, assigned students, pass verification and attendance. The existing driver dashboard API returns real counts; null assignments require an empty state. Duplicate attendance returns 409 and must remain visible to the driver.

Admin module pages can manage student/driver profiles, buses, routes and pickup points; review transport requests; create assignments; and view attendance. Assignment creation uses the existing `/api/admin/students/allocate` endpoint. The server supplies the permanent busPassId. Use rejectionReason for request rejection and show capacity/relationship errors without raw server details.

The shared dashboard currently provides only the common shell. Do not add fake data, unimplemented navigation destinations, additional authentication providers or unnecessary dependencies. Backend authorization remains mandatory even when the UI hides a control.
