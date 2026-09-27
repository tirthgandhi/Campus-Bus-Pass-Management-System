const { spawn } = require('child_process');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return { status: res.status, body };
}

async function main() {
  console.log('🚀 Starting backend smoke test...');

  const child = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
    process.stdout.write(chunk);
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
    process.stderr.write(chunk);
  });

  try {
    for (let i = 0; i < 25; i++) {
      await wait(500);
      try {
        const health = await request('/');
        console.log('Health check:', health.status, JSON.stringify(health.body));
        break;
      } catch {
        // server may still be booting
      }
    }

    console.log('\n🧪 Checking /api/auth/test');
    const testRoute = await request('/api/auth/test');
    console.log('Status:', testRoute.status);
    console.log('Body:', JSON.stringify(testRoute.body));

    console.log('\n🧪 Checking /api/auth/signup');
    const signup = await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Test User',
        email: 'smoke.test.user@example.com',
        password: '123456',
        role: 'student',
      }),
    });
    console.log('Status:', signup.status);
    console.log('Body:', JSON.stringify(signup.body));
  } catch (error) {
    console.error('❌ Smoke test error:', error.message);
    process.exitCode = 1;
  } finally {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
    console.log('\n🧹 Backend smoke test finished.');
  }
}

main();
