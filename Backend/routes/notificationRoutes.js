// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notificationController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.route('/').get(protect, getMyNotifications);
router.route('/:id/read').put(protect, markAsRead);

module.exports = router;
