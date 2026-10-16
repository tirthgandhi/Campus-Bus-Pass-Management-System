import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

let vite, AppRoutes, AuthContext;
before(async () => {
  vite = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  ({ default: AppRoutes } = await vite.ssrLoadModule('/src/common/routes/AppRoutes.jsx'));
  ({ AuthContext } = await vite.ssrLoadModule('/src/common/context/authState.js'));
});
after(async () => { await vite?.close(); });

function render(path, role) {
  const value = {
    loading: false,
    isAuthenticated: Boolean(role),
    user: role ? { name: 'Route Test', email: 'route-test@campus.example', role } : null,
  };
  return renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [path] },
    React.createElement(AuthContext.Provider, { value }, React.createElement(AppRoutes))));
}

test('landing route retains one public layout, main region and footer', () => {
  const html = render('/');
  assert.match(html, /University Transportation Portal/);
  assert.match(html, /How the System Works/);
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  assert.equal((html.match(/<footer\b/g) || []).length, 1);
  assert.match(html, /href="\/register\/student"/);
});

test('login retains all roles and hides public registration for admin', () => {
  const html = render('/login');
  for (const role of ['driver', 'admin']) assert.match(html, new RegExp(`value="${role}"`));
  assert.match(html, /Create Student Account/);
  const admin = render('/login?role=admin');
  assert.match(admin, /Administrator accounts are managed by the campus transport authority/);
  assert.doesNotMatch(admin, /Create Student Account|Create Driver Account/);
});

test('student and driver registration keep their existing role fields', () => {
  const student = render('/register/student');
  assert.match(student, /name="studentId"/);
  assert.match(student, /name="department"/);
  assert.doesNotMatch(student, /name="licenseNumber"/);
  const driver = render('/register/driver');
  assert.match(driver, /name="licenseNumber"/);
  assert.doesNotMatch(driver, /name="studentId"|name="department"/);
});

test('admin dashboard retains its administration layout', () => {
  const html = render('/admin/dashboard', 'admin');
  assert.match(html, /Welcome back, Admin/);
  assert.match(html, /class="admin-shell/);
  assert.equal((html.match(/<main\b/g) || []).length, 1);
});

test('driver dashboard uses the driver module loading state', () => {
  const html = render('/driver/dashboard', 'driver');
  assert.match(html, /Loading…/);
  assert.doesNotMatch(html, /Welcome back, Route Test|student-portal|admin-shell/);
});

test('role dashboards reject unauthenticated users and other roles', () => {
  for (const role of ['student', 'driver', 'admin']) {
    assert.equal(render(`/${role}/dashboard`), '');
    for (const other of ['student', 'driver', 'admin'].filter((value) => value !== role)) {
      assert.equal(render(`/${role}/dashboard`, other), '');
    }
  }
});

test('403 and 404 reuse the status component with the correct content', () => {
  assert.match(render('/unauthorized', 'student'), /Access Denied/);
  assert.match(render('/unauthorized', 'student'), /Return to Dashboard/);
  assert.match(render('/missing'), /Page Not Found/);
  assert.match(render('/register/admin'), /Page Not Found/);
  assert.match(render('/missing'), /Go Home/);
});

test('student dashboard uses its integrated portal and navigation', () => {
 const html=render('/student/dashboard','student');
 assert.match(html,/student-portal/);
 assert.match(html,/Route Test/);
 for(const label of ['Apply for Pass','Request Status','My Bus Pass','Bus &amp; Route','My Profile','Attendance History']) assert.ok(html.includes(label),label);
 assert.doesNotMatch(html,/localhost:5174/);
 assert.equal((html.match(/<main\b/g)||[]).length,1);
});
