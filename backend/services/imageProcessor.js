const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const { fileToImageData, getLocalPathForAI } = require('./cloudinaryService');

/**
 * Run CNN analysis and build image metadata for a complaint
 */
async function processUploadedFiles(files = []) {
  const images = [];

  for (const file of files) {
    let aiMeta = {};
    const localPath = getLocalPathForAI(file);
    const imageUrl = file.path?.startsWith('http') ? file.path : null;

    try {
      const payload = localPath
        ? { imagePath: path.resolve(localPath) }
        : imageUrl
          ? { imageUrl }
          : null;

      if (payload) {
        const aiRes = await axios.post(
          `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/analyze-image`,
          payload,
          { timeout: 15000 }
        );
        if (aiRes.data) {
          aiMeta = { category: aiRes.data.category, confidence: aiRes.data.confidence };
        }
      }
    } catch (err) {
      console.log('AI vision skipped:', err.message);
    }

    // Cloudinary: multer-storage-cloudinary sets secure_url on file
    if (file.path?.startsWith('http')) {
      file.cloudinaryUrl = file.path;
      file.publicId = file.filename;
    }

    images.push(fileToImageData(file, aiMeta));
  }

  return images;
}

module.exports = { processUploadedFiles };
