const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const InterviewSession = require('../models/InterviewSession');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user and cascade related resources (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    await user.deleteOne();
    await Application.deleteMany({ student: user._id });
    await Job.deleteMany({ recruiter: user._id });
    await InterviewSession.deleteMany({ student: user._id });

    res.json({
      success: true,
      message: 'User and related records removed'
    });
  } catch (err) {
    next(err);
  }
};
