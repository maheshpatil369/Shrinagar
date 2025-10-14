// /Backend/middleware/authMiddleware.js
// A new 'authorize' function has been added to handle role-based access control.

import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/userModel.js';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, please log in.');
    }

    const userRoles = [];
    if (req.user.isAdmin) userRoles.push('admin');
    if (req.user.isSeller) userRoles.push('seller');

    const hasPermission = roles.some(role => userRoles.includes(role));

    if (hasPermission) {
      next();
    } else {
      res.status(403); // Forbidden
      throw new Error('You do not have permission to perform this action.');
    }
  };
};

