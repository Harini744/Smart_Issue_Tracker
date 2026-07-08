const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeComplaint } = require('../services/nlpEngine');
const { sendStatusUpdateEmail, sendNewComplaintEmail } = require('../services/emailService');
const { processUploadedFiles } = require('../services/imageProcessor');

// @GET /api/complaints - Get student's own complaints
router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10, search } = req.query;
    const query = { student: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('student', 'name email studentId')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
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

// @POST /api/complaints - Submit new complaint
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, priority, isAnonymous, tags } = req.body;

    // Run NLP analysis
    const nlpAnalysis = analyzeComplaint(title, description);

    // Process uploaded images (local disk or Cloudinary + optional AI)
    const images = req.files?.length ? await processUploadedFiles(req.files) : [];

    // Determine final priority and category (NLP + optional CNN from first image)
    const finalPriority = priority || nlpAnalysis.detectedPriority;
    const visionCategory = images.find(img => img.aiCategory)?.aiCategory;
    const finalCategory = category || visionCategory || nlpAnalysis.suggestedCategory;

    const complaint = await Complaint.create({
      title,
      description,
      category: finalCategory,
      priority: finalPriority,
      student: req.user._id,
      isAnonymous: isAnonymous === 'true',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      images,
      nlpAnalysis,
      visionAnalysis: images[0]?.aiCategory ? {
        detectedCategory: images[0].aiCategory,
        confidence: images[0].aiConfidence
      } : undefined
    });

    await complaint.populate('student', 'name email studentId');

    // Notify student
    await Notification.create({
      user: req.user._id,
      title: 'Complaint Submitted',
      message: `Your complaint "${title}" has been submitted successfully.`,
      type: 'new_complaint',
      complaint: complaint._id
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Complaint Received',
        message: `"${title}" — ${finalCategory} (${finalPriority})`,
        type: 'new_complaint',
        complaint: complaint._id
      });
      if (process.env.EMAIL_USER && admin.email) {
        await sendNewComplaintEmail(admin.email, complaint, req.user);
      }
    }

    res.status(201).json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/complaints/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email studentId department')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Students can only view their own complaints
    if (req.user.role !== 'admin' && complaint.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    complaint.viewCount += 1;
    await complaint.save({ validateBeforeSave: false });

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/complaints/:id/comments - Add comment
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user.role !== 'admin' && complaint.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    complaint.comments.push({
      user: req.user._id,
      text: req.body.text,
      isAdmin: req.user.role === 'admin'
    });

    await complaint.save();
    await complaint.populate('comments.user', 'name role');

    // Notify student if admin commented
    if (req.user.role === 'admin') {
      await Notification.create({
        user: complaint.student,
        title: 'New Comment on Your Complaint',
        message: `An admin has commented on your complaint: "${complaint.title}"`,
        type: 'comment',
        complaint: complaint._id
      });
    }

    res.json({ success: true, comments: complaint.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/complaints/analyze - NLP analysis only
router.post('/analyze', protect, async (req, res) => {
  try {
    const { title, description } = req.body;
    const analysis = analyzeComplaint(title || '', description || '');
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
