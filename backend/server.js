const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for local uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Issue Tracker API running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to MongoDB (local or Atlas)
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-issue-tracker';

mongoose.connect(mongoUri)
  .then(() => {
    const isAtlas = mongoUri.includes('mongodb.net');
    console.log(`MongoDB connected${isAtlas ? ' (Atlas)' : ' (local)'}`);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Uploads: ${process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' ? 'Cloudinary' : 'Local /uploads'}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.error('Check MONGO_URI in backend/.env (Atlas: whitelist your IP, correct password)');
    process.exit(1);
  });

module.exports = app;
