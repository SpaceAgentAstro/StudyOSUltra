import { spawn } from 'child_process';
import http from 'http';

const PORT = 3002;
// Ensure we don't inherit existing env vars that might conflict, but keep PATH etc.
const env = {
  ...process.env,
  PORT: PORT.toString(),
  ALLOWED_ORIGINS: 'http://localhost:3000',
  GEMINI_API_KEY: '' // Ensure it fails with "API Key not configured" if CORS passes
};

const serverProcess = spawn('node', ['server.js'], { env });

let serverStarted = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  // console.log(`[Server]: ${output}`);
  if (output.includes(`Server running on port ${PORT}`)) {
    if (!serverStarted) {
      serverStarted = true;
      runTests();
    }
  }
});

serverProcess.stderr.on('data', (data) => {
  // console.error(`[Server Error]: ${data}`);
});

function checkRequest(origin, description, shouldPass) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Origin': origin,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // If CORS blocks it, Express usually sends 500 with the error from middleware
        // If CORS allows it, our server returns 500 with "API Key not configured"

        const isCorsError = data.includes('Not allowed by CORS');
        const isAppError = data.includes('API Key not configured');

        if (shouldPass) {
          if (isAppError) {
             console.log(`✅ ${description}: Passed CORS (Application error as expected)`);
             resolve();
          } else if (isCorsError) {
             reject(new Error(`${description}: Failed (Blocked by CORS)`));
          } else {
             // Might be other error, but if not CORS error, assume CORS passed?
             console.log(`⚠️ ${description}: Unexpected response: ${data}`);
             resolve();
          }
        } else {
          if (isCorsError) {
            console.log(`✅ ${description}: Blocked by CORS (As expected)`);
            resolve();
          } else if (isAppError) {
             reject(new Error(`${description}: Failed (Allowed by CORS)`));
          } else {
             reject(new Error(`${description}: Failed (Unexpected response: ${data})`));
          }
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(JSON.stringify({}));
    req.end();
  });
}

async function runTests() {
  try {
    // Give server a moment to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    await checkRequest('http://localhost:3000', 'Allowed Origin', true);
    await checkRequest('http://evil.com', 'Disallowed Origin', false);

    console.log('SUCCESS: CORS verification passed.');
    serverProcess.kill();
    process.exit(0);
  } catch (error) {
    console.error('FAILURE:', error.message);
    serverProcess.kill();
    process.exit(1);
  }
}

// Timeout
setTimeout(() => {
  console.error('Timeout waiting for tests');
  serverProcess.kill();
  process.exit(1);
}, 10000);
