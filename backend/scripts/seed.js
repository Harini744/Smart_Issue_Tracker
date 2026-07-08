/**
 * Seed database with demo admin, student, and categories.
 * Run: node scripts/seed.js (from backend folder)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-issue-tracker';

const categories = [
  { name: 'Infrastructure', description: 'Buildings, facilities, utilities', color: '#6366f1', keywords: ['building', 'water', 'electricity'] },
  { name: 'Academic', description: 'Classes, exams, faculty', color: '#8b5cf6', keywords: ['class', 'exam', 'professor'] },
  { name: 'Administrative', description: 'Fees, documents, admissions', color: '#06b6d4', keywords: ['fee', 'certificate', 'admission'] },
  { name: 'Hostel', description: 'Rooms, mess, dormitory', color: '#f59e0b', keywords: ['hostel', 'room', 'mess'] },
  { name: 'Library', description: 'Books, study rooms', color: '#10b981', keywords: ['library', 'book', 'study'] },
  { name: 'IT Support', description: 'Computers, network, software', color: '#3b82f6', keywords: ['computer', 'wifi', 'internet'] },
  { name: 'Safety', description: 'Security, harassment, hazards', color: '#ef4444', keywords: ['safety', 'security', 'theft'] },
  { name: 'Other', description: 'General issues', color: '#6b7280', keywords: [] }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Admin
  const adminExists = await User.findOne({ email: 'admin@college.edu' });
  if (!adminExists) {
    await User.create({
      name: 'System Admin',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created admin: admin@college.edu / admin123');
  } else {
    console.log('Admin already exists');
  }

  // Student
  const studentExists = await User.findOne({ email: 'student@college.edu' });
  if (!studentExists) {
    await User.create({
      name: 'Demo Student',
      email: 'student@college.edu',
      password: 'student123',
      role: 'student',
      studentId: 'STU2024001',
      department: 'Computer Science'
    });
    console.log('Created student: student@college.edu / student123');
  } else {
    console.log('Student already exists');
  }

  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { name: cat.name },
      cat,
      { upsert: true, new: true }
    );
  }
  console.log('Categories seeded');

  // Add sample complaints
  const student = await User.findOne({ email: 'student@college.edu' });
  const admin = await User.findOne({ email: 'admin@college.edu' });

  const sampleComplaints = [
    {
      title: 'WiFi connectivity issues in hostel block A',
      description: 'The WiFi signal in hostel block A is extremely weak and disconnects frequently. This is affecting my online classes and assignment submissions.',
      category: 'IT Support',
      priority: 'High',
      status: 'In Progress',
      student: student._id,
      assignedTo: admin._id
    },
    {
      title: 'Library air conditioning not working',
      description: 'The AC in the main study area of the library has been broken for a week. The temperature is unbearable during peak hours.',
      category: 'Infrastructure',
      priority: 'Medium',
      status: 'Pending',
      student: student._id
    },
    {
      title: 'Unfair marks in mathematics exam',
      description: 'I believe my mathematics exam has been marked incorrectly. Question 5 should have been awarded full marks according to the answer key.',
      category: 'Academic',
      priority: 'High',
      status: 'Pending',
      student: student._id
    },
    {
      title: 'Mess food quality has deteriorated',
      description: 'The quality and hygiene of food served in the hostel mess has significantly decreased. Many students have fallen ill recently.',
      category: 'Hostel',
      priority: 'Critical',
      status: 'In Progress',
      student: student._id,
      assignedTo: admin._id
    },
    {
      title: 'Certificate not received for completed course',
      description: 'I completed the summer training program last month but haven\'t received my certificate yet. I need it for job applications.',
      category: 'Administrative',
      priority: 'Medium',
      status: 'Resolved',
      student: student._id
    }
  ];

  for (const complaint of sampleComplaints) {
    const exists = await Complaint.findOne({ title: complaint.title });
    if (!exists) {
      await Complaint.create(complaint);
      console.log(`Created complaint: ${complaint.title}`);
    }
  }
  console.log('Sample complaints seeded');

  await mongoose.disconnect();
  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
