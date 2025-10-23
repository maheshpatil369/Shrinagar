// Backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


// Configure Multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shrinagar_uploads', // Optional: specify a folder in Cloudinary
    format: async (req, file) => 'webp', // Example: Convert images to webp format
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`, // Create a unique file name
  },
});

// Function to check file type
function checkFileType(file, cb) {
  const filetypes = /jpe?g|png|webp/;
  console.log(`Checking file: ${file.originalname}, MIME type: ${file.mimetype}`); // <-- Debug log

  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    console.error(`File type rejected: ${file.originalname}, MIME type: ${file.mimetype}`); // <-- Debug log
    cb(new Error('Images only! (jpg, jpeg, png, webp)'));
  }
}

// Configure Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Optional: Limit file size (e.g., 5MB)
});

// Route handler
router.post('/', protect, (req, res) => {
    const uploadSingle = upload.single('image');

    console.log('Attempting image upload...'); // <-- Debug log

    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error('Multer Error:', err); // <-- Debug log
            return res.status(400).json({ message: `Multer Error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error('Upload Error:', err); // <-- Debug log
             return res.status(400).json({ message: err.message || 'Image upload failed.' });
        }

        console.log('Received file:', req.file ? req.file.originalname : 'No file'); // <-- Debug log
        // Everything went fine.
        if (!req.file) {
          return res.status(400).json({ message: 'Please upload an image file' });
        }

        res.status(200).send({
          message: 'Image uploaded successfully to Cloudinary',
          image: req.file.path, // Return the Cloudinary URL
        });
    });
});


module.exports = router;

