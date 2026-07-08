const cloudinary = require('cloudinary').v2;

const isConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
  );

if (isConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary configured for image uploads');
}

/**
 * Normalize multer file object (local disk or Cloudinary) to complaint image shape
 */
function fileToImageData(file, aiMeta = {}) {
  if (file.cloudinaryUrl || file.path?.startsWith('http')) {
    return {
      url: file.cloudinaryUrl || file.path,
      publicId: file.publicId || file.filename,
      aiCategory: aiMeta.category || null,
      aiConfidence: aiMeta.confidence || null
    };
  }
  return {
    url: `/uploads/${file.filename}`,
    publicId: file.filename,
    aiCategory: aiMeta.category || null,
    aiConfidence: aiMeta.confidence || null
  };
}

/**
 * Get local path for AI service (disk upload) or temp download from Cloudinary URL
 */
function getLocalPathForAI(file) {
  if (file.path && !file.path.startsWith('http')) {
    return file.path;
  }
  return null;
}

module.exports = {
  cloudinary,
  isConfigured,
  fileToImageData,
  getLocalPathForAI
};
