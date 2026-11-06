const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
