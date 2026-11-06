const http = require('http');

// Helper to make HTTP request
const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- Starting CareerForge API Smoke Tests ---');

  // 1. Health check
  try {
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    console.log(`✓ Health check: [${health.status}]`, health.body?.service || health.body);
  } catch (err) {
    console.error('✗ Server offline. Please start server first:', err.message);
    process.exit(1);
  }

  // 2. Demo Student Login
  let studentToken = '';
  try {
    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/demo',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { role: 'student' }
    );
    console.log(`✓ Demo Student Login: [${loginRes.status}]`, loginRes.body?.user?.name, `(Role: ${loginRes.body?.user?.role})`);
    studentToken = loginRes.body?.token;
  } catch (err) {
    console.error('✗ Demo student login failed:', err.message);
  }

  // 3. Authenticated Student Me Route
  try {
    const meRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`✓ Student /me check: [${meRes.status}] Verified ${meRes.body?.user?.email}`);
  } catch (err) {
    console.error('✗ Student /me failed:', err.message);
  }

  // 4. Jobs List
  try {
    const jobsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/jobs',
      method: 'GET'
    });
    console.log(`✓ Jobs API: [${jobsRes.status}] Retrieved ${jobsRes.body?.count} active listings`);
  } catch (err) {
    console.error('✗ Jobs fetch failed:', err.message);
  }

  // 5. Student ATS Resume
  try {
    const resumeRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/resume/my-resume',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`✓ Student Resume API: [${resumeRes.status}] ATS Score: ${resumeRes.body?.resume?.atsScore}/100`);
  } catch (err) {
    console.error('✗ Resume fetch failed:', err.message);
  }

  // 6. Admin Analytics Check
  try {
    const adminLoginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/demo',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { role: 'admin' }
    );
    const adminToken = adminLoginRes.body?.token;
    const analyticsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ Admin Analytics API: [${analyticsRes.status}] Total Students: ${analyticsRes.body?.stats?.totalStudents}, Total Jobs: ${analyticsRes.body?.stats?.totalJobs}`);
  } catch (err) {
    console.error('✗ Admin analytics failed:', err.message);
  }

  console.log('--- All Smoke Tests Completed Successfully! ---');
  process.exit(0);
}

runTests();
