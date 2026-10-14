# Student frontend integration

The completed common frontend provides student registration, login, JWT sessions, role protection and the `/student/dashboard` shell. Preserve that interface and build future student pages under its existing AppLayout and RoleRoute.

Registration collects full name, college email, enrollment number, phone, department and password. The enrollment field maps to existing `studentId`; college email maps to `collegeEmail`. Login sends college email as `email` together with `role: student`. Confirm password stays in the browser.

Use `src/common/services/api.js` for all protected calls. Available APIs are documented in [BACKEND_AUTH_STUDENT.md](BACKEND_AUTH_STUDENT.md): own profile, active pickup points, transport requests, current assignment/pass and attendance. The current assignment response is null until an administrator assigns transport. Show an honest empty state; never fabricate request status, assignments or attendance counts.

Future pages may include request submission/status, bus/route details, profile editing and attendance history. Do not register navigation links until the destination page exists. The common Dashboard, navbar, profile menu, responsive sidebar and logout modal remain shared.

Verify role authorization, labels, keyboard access, errors, loading and layouts at 1440, 1024, 768 and 390 pixels. Preserve the existing technology stack and professional visual system.
