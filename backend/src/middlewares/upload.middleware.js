const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Files are held in memory only, then streamed to Cloudinary — never written
// to the backend's local filesystem (Render/Railway free tier disk is
// ephemeral and gets wiped on restart/redeploy — hard constraint, not a choice).
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Only .pdf, .jpg, .png files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = upload;