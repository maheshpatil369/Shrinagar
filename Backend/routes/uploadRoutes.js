// maheshpatil369/shrinagar/Shrinagar-fec0a47de051ffa389da59e3900a2428b5397e43/Backend/routes/uploadRoutes.js
const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');

// Configure storage for Multer to keep files in memory
const storage = multer.memoryStorage();

// Function to check that the file is an image
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! (jpg, jpeg, png, gif)'));
  }
}

// Initialize upload middleware with memory storage and file filter
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload an image and convert to Base64
// @route   POST /api/upload
// @access  Private (requires token)
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file' });
  }
  
  // Convert the image buffer to a Base64 Data URI
  const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  
  // Return the Base64 URI
  res.status(200).json({
    message: 'Image uploaded successfully',
    image: base64Image,
  });
});

module.exports = router;
