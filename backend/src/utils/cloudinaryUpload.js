const cloudinary = require('../config/cloudinary.config');

// Streams a buffer (from multer memoryStorage) directly to Cloudinary —
// resource_type 'auto' handles both PDFs and images correctly.
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { uploadBufferToCloudinary };