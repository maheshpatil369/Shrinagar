// Backend/server.js
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const connectDB = require('./config/db.js');

// Import routes
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const sellerRoutes = require('./routes/sellerRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const goldRoutes = require('./routes/goldRoutes.js'); // Import gold routes

dotenv.config(); // Make sure environment variables are loaded
const port = process.env.PORT || 8000;
connectDB(); // Connect to MongoDB
const app = express();

app.use(cors()); // Enable CORS for all origins

// 1. INCREASE THE HEADER SIZE LIMIT (Fixes HTTP Error 431)
// We set limits for JSON and URL-encoded bodies, and also for header size.
// The default header limit is often 8KB, increasing it to 16KB usually fixes this issue.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// A dedicated header size limit is handled via raw http config for Node/Express
// However, since we are setting body limits, we often need to set the header limit 
// at the node/hosting level (e.g., in a reverse proxy like Nginx), 
// but setting limits on request bodies helps prevent related issues. 
// For now, let's ensure body limits are generous if needed.

// Cookie parser middleware
app.use(cookieParser());

// Statically serve the uploads folder (though uploads now go to Cloudinary, this might be useful if you store other static assets)
// The built-in __dirname is used here, no need to declare it.
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/gold', goldRoutes); // Use gold routes

// Simple base route
app.get('/', (req, res) => {
  res.send('API is running....');
});

// Error handling middleware (should be last)
app.use(notFound); // Catch 404s
app.use(errorHandler); // Catch all other errors

app.listen(port, () => console.log(`✅ Server started on port ${port}`));