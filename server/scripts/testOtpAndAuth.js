const nodemailer = require('nodemailer');

// Capture outgoing emails for testing without exposing OTP to client
let lastDispatchedMail = null;
const originalCreateTransport = nodemailer.createTransport;
nodemailer.createTransport = () => ({
  sendMail: async (mailOptions) => {
    lastDispatchedMail = mailOptions;
    return { messageId: 'test-mock-msg-id', accepted: [mailOptions.to] };
  }
});

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const Otp = require('../models/Otp');
const authController = require('../controllers/authController');

// Mock Express req, res, next
function createMockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
  return res;
}

async function runRealWorldOtpTests() {
  console.log('========================================================');
  console.log('🛡️  TESTING REAL-WORLD SECURE OTP AUTHENTICATION SYSTEM');
  console.log('========================================================\n');

  try {
    // Configure mock SMTP for test environment
    process.env.SMTP_USER = 'security@careerforge.io';
    process.env.SMTP_PASSWORD = 'app-password-test';

    await connectDB();

    const studentEmail = 'student.production@university.edu';
    const recruiterEmail = 'recruiter.production@techhiring.com';

    await User.deleteMany({ email: { $in: [studentEmail, recruiterEmail] } });
    await PendingRegistration.deleteMany({ email: { $in: [studentEmail, recruiterEmail] } });
    await Otp.deleteMany({ email: { $in: [studentEmail, recruiterEmail, 'admin@careerforge.io'] } });

    // -------------------------------------------------------------------------
    // TEST 1: STUDENT REGISTRATION (OTP SENT ONLY VIA EMAIL, NOT IN API RESPONSE)
    // -------------------------------------------------------------------------
    console.log('1️⃣  TEST: Student Registration & Email OTP Dispatch');
    lastDispatchedMail = null;

    let req = {
      body: {
        name: 'Aarav Patel',
        email: studentEmail,
        password: 'SecurePassword123!',
        role: 'student',
        college: 'GLA University'
      }
    };
    let res = createMockRes();
    await authController.register(req, res, (err) => { throw err; });

    console.log(`   Response status: [${res.statusCode}]`);
    console.log(`   requireOtp: ${res.data.requireOtp}`);
    console.log(`   devOtp in response? ${Boolean(res.data.devOtp)} (MUST BE FALSE)`);

    if (res.data.devOtp !== undefined) {
      throw new Error('SECURITY VIOLATION: OTP was returned in the API response!');
    }
    if (!lastDispatchedMail || lastDispatchedMail.to !== studentEmail) {
      throw new Error('FAILED: Email was not sent to the student address!');
    }

    console.log(`   Email dispatched to: ${lastDispatchedMail.to}`);
    console.log(`   Email Subject: "${lastDispatchedMail.subject}"`);
    console.log(`   Email masked in API response: ${res.data.targetEmailMasked}`);

    // Extract OTP from email body to verify it works like checking an inbox
    const otpMatch = lastDispatchedMail.text.match(/\b\d{6}\b/);
    if (!otpMatch) {
      throw new Error('FAILED: 6-digit verification code not found in email body!');
    }
    const dispatchedStudentOtp = otpMatch[0];
    console.log(`   ✓ Received OTP inside email body: ${dispatchedStudentOtp}`);

    // Verify PendingRegistration stores HASHED OTP, not plain text
    const pendingDoc = await PendingRegistration.findOne({ email: studentEmail });
    if (!pendingDoc.hashedOtp || pendingDoc.hashedOtp === dispatchedStudentOtp) {
      throw new Error('SECURITY VIOLATION: OTP is stored in plain text in database!');
    }
    console.log(`   ✓ Database verification: OTP is securely hashed with bcrypt`);

    // Test Invalid OTP attempt
    console.log('   Testing invalid OTP attempt rejection...');
    req = { body: { email: studentEmail, otp: '000000' } };
    res = createMockRes();
    await authController.verifyRegisterOtp(req, res, (err) => { throw err; });
    if (res.statusCode !== 400 || !res.data.message.includes('Invalid')) {
      throw new Error('FAILED: Invalid OTP was not rejected!');
    }
    console.log(`   ✓ Invalid OTP rejected: "${res.data.message}"`);

    // Test Valid OTP verification
    console.log('   Testing valid OTP verification...');
    req = { body: { email: studentEmail, otp: dispatchedStudentOtp } };
    res = createMockRes();
    await authController.verifyRegisterOtp(req, res, (err) => { throw err; });

    if (res.statusCode !== 201 || !res.data.token) {
      throw new Error('FAILED: Valid OTP verification failed!');
    }
    console.log(`   ✓ User created and verified: ${res.data.user.name} [Role: ${res.data.user.role}]`);
    console.log('   ✅ TEST 1 PASSED: Student registered, OTP sent via email only, securely hashed.\n');

    // -------------------------------------------------------------------------
    // TEST 2: STUDENT LOGIN WITH 2FA OTP
    // -------------------------------------------------------------------------
    console.log('2️⃣  TEST: Student Login with 2FA OTP');
    lastDispatchedMail = null;

    req = { body: { email: studentEmail, password: 'SecurePassword123!' } };
    res = createMockRes();
    await authController.login(req, res, (err) => { throw err; });

    if (res.data.devOtp !== undefined) {
      throw new Error('SECURITY VIOLATION: OTP returned in login response!');
    }
    if (!lastDispatchedMail || lastDispatchedMail.to !== studentEmail) {
      throw new Error('FAILED: Login OTP was not sent to student email!');
    }

    const loginOtp = lastDispatchedMail.text.match(/\b\d{6}\b/)[0];
    const storedOtpDoc = await Otp.findOne({ email: studentEmail, purpose: 'login' });
    if (!storedOtpDoc || storedOtpDoc.hashedOtp === loginOtp) {
      throw new Error('SECURITY VIOLATION: Login OTP not hashed in database!');
    }
    console.log(`   ✓ Login OTP dispatched to email only and securely hashed in database.`);

    // Verify Login OTP
    req = { body: { email: studentEmail, otp: loginOtp } };
    res = createMockRes();
    await authController.verifyOtp(req, res, (err) => { throw err; });

    if (res.statusCode !== 200 || !res.data.token) {
      throw new Error('FAILED: Student login OTP verification failed!');
    }

    // Verify OTP was invalidated immediately after use
    const invalidatedOtp = await Otp.findOne({ email: studentEmail, purpose: 'login' });
    if (invalidatedOtp) {
      throw new Error('SECURITY VIOLATION: OTP was not invalidated after successful login!');
    }
    console.log('   ✓ OTP successfully invalidated immediately after verification.');
    console.log('   ✅ TEST 2 PASSED: Student login 2FA OTP verified and invalidated.\n');

    // -------------------------------------------------------------------------
    // TEST 3: RECRUITER REGISTRATION & LOGIN
    // -------------------------------------------------------------------------
    console.log('3️⃣  TEST: Recruiter Registration & Email OTP');
    lastDispatchedMail = null;

    req = {
      body: {
        name: 'Sarah Jenkins',
        email: recruiterEmail,
        password: 'RecruiterPassword2026!',
        role: 'recruiter',
        companyName: 'CloudNova Systems'
      }
    };
    res = createMockRes();
    await authController.register(req, res, (err) => { throw err; });

    if (res.data.devOtp !== undefined || lastDispatchedMail.to !== recruiterEmail) {
      throw new Error('FAILED: Recruiter OTP handling violation!');
    }

    const recruiterOtp = lastDispatchedMail.text.match(/\b\d{6}\b/)[0];
    req = { body: { email: recruiterEmail, otp: recruiterOtp } };
    res = createMockRes();
    await authController.verifyRegisterOtp(req, res, (err) => { throw err; });
    console.log(`   ✓ Recruiter verified: ${res.data.user.name} (${res.data.user.companyName})`);
    console.log('   ✅ TEST 3 PASSED: Recruiter registration with email OTP verified.\n');

    // -------------------------------------------------------------------------
    // TEST 4: ADMIN LOGIN (OTP DISPATCHED TO nitin2911.in@gmail.com)
    // -------------------------------------------------------------------------
    console.log('4️⃣  TEST: Admin Login (OTP Dispatched to Producer nitin2911.in@gmail.com)');
    lastDispatchedMail = null;

    req = { body: { email: 'admin@careerforge.io', password: 'password123' } };
    res = createMockRes();
    await authController.login(req, res, (err) => { throw err; });

    if (res.data.devOtp !== undefined) {
      throw new Error('SECURITY VIOLATION: Admin OTP exposed in response!');
    }
    if (!lastDispatchedMail || lastDispatchedMail.to !== 'nitin2911.in@gmail.com') {
      throw new Error('FAILED: Admin OTP was not dispatched to nitin2911.in@gmail.com!');
    }

    console.log(`   ✓ Admin OTP email destination confirmed: ${lastDispatchedMail.to}`);
    console.log(`   ✓ Masked in API response: ${res.data.targetEmailMasked}`);

    const adminOtp = lastDispatchedMail.text.match(/\b\d{6}\b/)[0];
    req = { body: { email: 'admin@careerforge.io', otp: adminOtp } };
    res = createMockRes();
    await authController.verifyOtp(req, res, (err) => { throw err; });

    console.log(`   ✓ Admin verified: ${res.data.user.name} [Role: ${res.data.user.role}]`);
    console.log('   ✅ TEST 4 PASSED: Admin login OTP dispatched to nitin2911.in@gmail.com.\n');

    // -------------------------------------------------------------------------
    // TEST 5: MISSING EMAIL SERVICE ERROR HANDLING
    // -------------------------------------------------------------------------
    console.log('5️⃣  TEST: Missing Email Service Configuration Handling');
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_PASS;

    req = { body: { email: studentEmail, password: 'SecurePassword123!' } };
    res = createMockRes();
    await authController.login(req, res, (err) => { throw err; });

    console.log(`   Status code: [${res.statusCode}]`);
    console.log(`   Message returned: "${res.data.message}"`);

    if (res.statusCode !== 503 || !res.data.message.includes('Email service is not configured')) {
      throw new Error('FAILED: Missing SMTP configuration did not return proper 503 error!');
    }
    console.log('   ✅ TEST 5 PASSED: Clean "Email service is not configured" returned when SMTP unset.\n');

    console.log('========================================================');
    console.log('🎉 ALL REAL-WORLD SECURITY & OTP TESTS PASSED 100%!');
    console.log('========================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
  }
}

runRealWorldOtpTests();
