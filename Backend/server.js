// maheshpatil369/shrinagar/Shrinagar-f1ede353ebcd0107a58d8a5b477911c8c5eb4f1d/Backend/server.js
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

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Statically serve the uploads folder.
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

app.get('/', (req, res) => {
  res.send('API is running....');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`✅ Server started on port ${port}`));

