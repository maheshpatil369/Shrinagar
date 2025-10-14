// shringar-backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const sellerRoutes = require('./routes/sellerRoutes');


// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// --- Middleware ---

// CORS Options to allow requests from your frontend development server
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Enable Cross-Origin Resource Sharing
app.use(cors(corsOptions));
// Enable express to parse JSON bodies from incoming requests
app.use(express.json());

// --- Basic Test Route ---
app.get('/', (req, res) => {
  res.send('Shringar API is running...');
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellerRoutes);


// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

// --- Port Configuration ---
const PORT = process.env.PORT || 8000;

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
