import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

// CORS Options - Configure for your frontend origin
const corsOptions = {
  origin: 'http://localhost:3000', // In production, change this to your frontend's domain
  credentials: true, // This allows cookies to be sent
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
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
  console.log(
    `Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
