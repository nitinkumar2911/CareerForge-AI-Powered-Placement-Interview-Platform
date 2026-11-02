const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/apply/:jobId', protect, authorize('student'), applyForJob);
router.get('/my-applications', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
