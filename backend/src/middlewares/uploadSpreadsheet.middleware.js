const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Separate multer instance for Excel/CSV bulk-upload endpoints (Test questions) —
// kept independent from upload.middleware.js (which restricts to PDF/JPG/PNG for
// Notes/branding uploads) so each upload type has its own correct allow-list.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // older .xls, sometimes sent for .csv too on Windows
  'text/csv',
  'application/csv',
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB, per bulk-upload spec

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Only .xlsx and .csv files are allowed'));
  }
  cb(null, true);
};

const uploadSpreadsheet = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = uploadSpreadsheet;