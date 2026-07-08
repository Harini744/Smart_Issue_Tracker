const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');
const { sendStatusUpdateEmail } = require('../services/emailService');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// @GET /api/admin/dashboard - Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      highPriorityComplaints,
      criticalComplaints,
      totalStudents,
      recentComplaints
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ priority: 'High', status: { $ne: 'Resolved' } }),
      Complaint.countDocuments({ priority: 'Critical', status: { $ne: 'Resolved' } }),
      User.countDocuments({ role: 'student' }),
      Complaint.find()
        .populate('student', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Priority breakdown
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        highPriorityComplaints,
        criticalComplaints,
        totalStudents,
        resolutionRate: totalComplaints > 0
          ? Math.round((resolvedComplaints / totalComplaints) * 100)
          : 0
      },
      recentComplaints,
      categoryStats,
      monthlyTrend,
      priorityStats
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/complaints - All complaints with filters
router.get('/complaints', async (req, res) => {
  try {
    const {
      status, priority, category, search,
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('student', 'name email studentId department')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      complaints,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/admin/complaints/:id/status - Update complaint status
router.put('/complaints/:id/status', async (req, res) => {
  try {
    const { status, assignedTo, adminNote } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('student');

    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (status === 'Resolved') complaint.resolvedAt = new Date();

    if (adminNote) {
      complaint.comments.push({
        user: req.user._id,
        text: adminNote,
        isAdmin: true
      });
    }

    await complaint.save();

    // Notify student
    await Notification.create({
      user: complaint.student._id,
      title: 'Complaint Status Updated',
      message: `Your complaint "${complaint.title}" status changed to ${status}`,
      type: 'status_update',
      complaint: complaint._id
    });

    // Send email notification
    if (complaint.student.emailNotifications) {
      await sendStatusUpdateEmail(complaint.student, complaint);
    }

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/admin/complaints/:id/priority - Update priority
router.put('/complaints/:id/priority', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { priority: req.body.priority },
      { new: true }
    ).populate('student', 'name email');

    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/users - All users
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/admin/users/:id/toggle - Toggle user active status
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/export - Export complaints as JSON
router.get('/export', async (req, res) => {
  try {
    const { status, priority, category, format = 'json' } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate('student', 'name email studentId department')
      .populate('assignedTo', 'name email')
      .lean();

    if (format === 'csv') {
      const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Student', 'Email', 'Created At'];
      const rows = complaints.map(c => [
        c._id, c.title, c.category, c.priority, c.status,
        c.student?.name, c.student?.email,
        new Date(c.createdAt).toLocaleDateString()
      ]);

      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
      return res.send(csv);
    }

    res.json({ success: true, data: complaints, total: complaints.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
