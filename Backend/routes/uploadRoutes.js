// maheshpatil369/shrinagar/Shrinagar-5f116f4d15321fb5db89b637c78651e13d353027/Backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');

// Configure multer for memory storage to get the file as a buffer
const storage = multer.memoryStorage();

// Function to check file type
function checkFileType(file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! (jpg, jpeg, png, webp)'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload an image and return it as a Base64 data URI
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file' });
  }

  // Convert the file buffer to a Base64 data URI
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  // Return the data URI
  res.status(200).send({
    message: 'Image uploaded successfully',
    image: dataURI,
  });
});

module.exports = router;

