// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Backend/server.js
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

dotenv.config();
const port = process.env.PORT || 8000;
connectDB();
const app = express();

app.use(cors());

// Increase body parser limit for Base64 image data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('API is running....');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`✅ Server started on port ${port}`));

