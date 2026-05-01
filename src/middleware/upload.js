const multer = require('multer');
const ApiError = require('../utils/ApiError');

const MAX_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(ApiError.badRequest('Only image uploads are allowed'));
  }
  cb(null, true);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 1 },
});

const singleImage = (field = 'avatar') => (req, res, next) => {
  uploader.single(field)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('Image is too large (max 5MB)'));
      }
      return next(ApiError.badRequest(err.message));
    }
    next(err);
  });
};

module.exports = { singleImage };
