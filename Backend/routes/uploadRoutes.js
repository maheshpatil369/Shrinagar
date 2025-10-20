const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Function to check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload an image and return its path
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file' });
  }

  // Return the URL path to the uploaded file
  res.status(200).send({
    message: 'Image uploaded successfully',
    image: `/${req.file.path.replace(/\\/g, '/')}`, // Normalize path for web
  });
});

module.exports = router;

  