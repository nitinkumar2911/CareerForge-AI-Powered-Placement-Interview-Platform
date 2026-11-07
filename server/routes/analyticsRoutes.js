const express = require('express');
const router = express.Router();
const {
  getPlatformAnalytics,
  requestAnalytics,
  getAnalyticsRequests,
  shareAnalytics,
  getMyAnalyticsRequests
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, authorize('admin', 'recruiter'), getPlatformAnalytics);
router.post('/request', protect, authorize('student', 'recruiter'), requestAnalytics);
router.get('/my-requests', protect, authorize('student', 'recruiter'), getMyAnalyticsRequests);
router.get('/requests', protect, authorize('admin'), getAnalyticsRequests);
router.post('/share/:id', protect, authorize('admin'), shareAnalytics);

module.exports = router;
