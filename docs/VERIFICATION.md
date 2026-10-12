# Verification record

Validated the completed common frontend and nine-model database/API update.

## Automated checks

- `node backend/tests/nine-model-integration.cjs`: **118 assertions passed** against real Express HTTP endpoints and MongoDB in an isolated database. Cleanup confirmed.
- `node --test frontend/tests/auth-services.test.mjs`: **13 tests passed**.
- Frontend ESLint: passed.
- Vite production build: passed.
- Backend JavaScript syntax checks: passed.
- Git whitespace check: passed.
- Exactly nine model files and nine runtime database collections confirmed.
- No imports, schemas or live routes depend on removed models. The integration suite explicitly checks removed feature URLs return 404.

API coverage includes direct-role signup/login, bcrypt persistence, JWT identity, role restrictions, safe serialization, profile access, CRUD, pickup selection, request creation/rejection/approval, generated pass IDs, capacity limits, concurrent final-seat allocation, duplicate active assignments, driver pass verification, concurrent duplicate attendance and referential deletion guards.

## Browser checks

Used the running frontend with the disposable backend to verify:

- Student and driver registration submit successfully to the real API.
- Invalid credentials produce a concise inline error; password visibility toggles work.
- Student, driver and admin logins reach their respective dashboards.
- Admin login has no public registration links; `/register/admin` is a 404.
- Signed-out protected access redirects to login; wrong-role access shows 403.
- Refresh restores the authenticated session.
- Profile details show server identity; modal Escape restores focus.
- Logout cancellation preserves the session; confirmation returns to login.
- Sidebar collapse, mobile/tablet drawer and public mobile navigation work.
- Inspected desktop (1440), laptop (1024), tablet (768), and mobile (390) layouts; no horizontal overflow on inspected screens.

A Vite context-refresh problem discovered during testing was corrected by keeping the context in a stable module. The final browser session has no runtime errors.

## Deliberate limits

- No production data migration, deletion, deployment or admin provisioning was performed. Existing installations must follow `DATABASE.md` before cutover.
- The optional email-verification delivery flow was not exercised because SMTP is not configured. Normal signup/login does not depend on it.
- Role-specific operational APIs were tested; detailed role-specific frontend pages remain separate module work, as required by Issue 1.
