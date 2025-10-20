// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { 
    getDashboardStats,
    getChartData,
    getPendingApprovals,
    getSellerHistory,
    adminGetAllSellers,
    getSellerDetailsForAdmin,
    adminUpdateSellerStatus,
    adminGetAllProducts,
    adminUpdateProductStatus,
    adminDeleteProduct,
    adminGetAllUsers,
    adminUpdateUserRole,
    adminDeleteUser,
} = require('../controllers/adminController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// ====================== Dashboard & Approvals ======================
router.route('/stats').get(protect, admin, getDashboardStats);
router.route('/chart-data').get(protect, admin, getChartData);
router.route('/approvals').get(protect, admin, getPendingApprovals);

// ====================== Seller Management ======================
router.route('/sellers').get(protect, admin, adminGetAllSellers);
router.route('/sellers/:id').get(protect, admin, getSellerDetailsForAdmin);
router.route('/sellers/:id/status').put(protect, admin, adminUpdateSellerStatus);
router.route('/sellers/:id/history').get(protect, admin, getSellerHistory);

// ====================== Product Management ======================
router.route('/products').get(protect, admin, adminGetAllProducts);
// NOTE: Using POST for status update to match client request
router.route('/products/:id/status').post(protect, admin, adminUpdateProductStatus);
router.route('/products/:id').delete(protect, admin, adminDeleteProduct);

// ====================== User Management ======================
router.route('/users').get(protect, admin, adminGetAllUsers);
router.route('/users/:id').delete(protect, admin, adminDeleteUser);
router.route('/users/:id/role').put(protect, admin, adminUpdateUserRole);

module.exports = router;
