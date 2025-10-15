// server.js
// ===============================================
// Shrinagar Backend - Express Server Setup
// ===============================================

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs'); // Import the file system module
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const connectDB = require('./config/db.js');

// Import routes
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const sellerRoutes = require('./routes/sellerRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes.js');

// Load environment variables
dotenv.config();

// Set port
const port = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// --- Create uploads directory if it doesn't exist ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log(`Created directory: ${uploadsDir}`);
}
// ---

// Enable CORS for all routes
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/upload', uploadRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running....');
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(port, () => console.log(`✅ Server started on port ${port}`));
