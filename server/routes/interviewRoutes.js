const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessionById,
  getMySessions,
  getAllSessions,
  uploadMiddleware,
  uploadRecording
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/', protect, authorize('student'), createSession);
router.post('/:id/recording', protect, uploadMiddleware, uploadRecording);
router.get('/my-sessions', protect, authorize('student'), getMySessions);
router.get('/admin/all', protect, authorize('admin'), getAllSessions);
router.get('/:id', protect, getSessionById);

module.exports = router;
