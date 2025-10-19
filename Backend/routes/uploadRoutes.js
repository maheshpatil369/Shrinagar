// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware.js');

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @desc    Upload an image and return as Base64 data URI
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file' });
  }

  // Convert buffer to Base64 Data URI
  const mimeType = req.file.mimetype;
  const base64Data = req.file.buffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  res.status(200).json({
    message: 'Image processed successfully',
    image: dataUri,
  });
});

module.exports = router;

