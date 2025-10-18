// ===============================================
// Shrinagar Backend - Express Server Setup
// ===============================================

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

// Load environment variables
dotenv.config();

// Set port
const port = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Enable CORS for all routes
app.use(cors());

// Body parser middleware
// Increase the limit to allow for larger Base64 image strings
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser middleware
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running....');
});

// NOTE: The static file serving for '/uploads' has been removed
// as images are now stored in the database.

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(port, () => console.log(`✅ Server started on port ${port}`));
