const express = require('express');
const router = express.Router();
const {
    getSellerDetailsForAdmin,
    getAdminDashboardStats,
    getAdminChartData,
    adminGetAllUsers,
    adminGetAllSellers,
    adminGetAllProducts,
    getPendingApprovals,
    updateSellerStatus,
    updateProductStatus,
} = require('../controllers/adminController.js');

const { protect, admin } = require('../middleware/authMiddleware.js');

// Admin only routes - Apply 'protect' and 'admin' middleware to ensure authentication and authorization
router.use(protect);
router.use(admin);

// Dashboard and Statistics
router.route('/stats').get(getAdminDashboardStats);
router.route('/chart-data').get(getAdminChartData);
router.route('/approvals').get(getPendingApprovals);

// User Management
router.route('/users').get(adminGetAllUsers);
// router.route('/users/:id').delete(deleteUser); // Placeholder if delete is needed

// Seller Management
router.route('/sellers/all').get(adminGetAllSellers);
router.route('/sellers/details/:id').get(getSellerDetailsForAdmin); // FIXED ROUTE PATH
router.route('/sellers/:id/status').put(updateSellerStatus);

// Product Management
router.route('/products/all').get(adminGetAllProducts);
router.route('/products/:id/status').put(updateProductStatus);
// router.route('/products/:id').delete(deleteProduct); // Placeholder if delete is needed


module.exports = router;