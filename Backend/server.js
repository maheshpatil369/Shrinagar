// Backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Import cookie-parser
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// --- Middleware ---

// CORS Options to allow requests from your frontend development server
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200,
};

// Enable Cross-Origin Resource Sharing
app.use(cors(corsOptions));
// Enable express to parse JSON bodies from incoming requests
app.use(express.json());
// Enable express to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Enable cookie parser
app.use(cookieParser());

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
