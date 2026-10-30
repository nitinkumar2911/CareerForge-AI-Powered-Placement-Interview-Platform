const express = require('express');
const router = express.Router();
const {
  register,
  verifyRegisterOtp,
  resendRegisterOtp,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  updateProfile,
  demoLogin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-register-otp', verifyRegisterOtp);
router.post('/resend-register-otp', resendRegisterOtp);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/demo', demoLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
