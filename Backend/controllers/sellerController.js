// maheshpatil369/shrinagar/Shrinagar-abcbe203037457af5cdd1912b6e3260dabf070c5/Backend/controllers/sellerController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const Seller = require('../models/sellerModel.js');
const SellerHistory = require('../models/sellerHistoryModel.js');
const User = require('../models/userModel.js');
const Product = require('../models/productModel.js');

// Helper to compare nested objects like 'address' or 'verificationDocuments'
const getChangedFields = (oldObj, newObj) => {
    // ... existing code ...
    const changes = [];
    // Ensure objects are not null/undefined before getting keys
    const oldKeys = oldObj ? Object.keys(oldObj) : [];
    const newKeys = newObj ? Object.keys(newObj) : [];
    const allKeys = new Set([...oldKeys, ...newKeys]);

    for (const key of allKeys) {
        const oldValue = oldObj ? oldObj[key] : undefined;
        const newValue = newObj ? newObj[key] : undefined;
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({
                field: key,
                oldValue: JSON.stringify(oldValue) || 'N/A',
                newValue: JSON.stringify(newValue),
            });
        }
    }
    return changes;
};

// @desc    Enroll or Update a seller profile and log history
// @route   POST /api/sellers/enroll
// @access  Private/Seller
const enrollSeller = asyncHandler(async (req, res) => {
    // ... existing code ...
  const { businessName, gstNumber, panNumber, address, verificationDocuments } = req.body;
  const userId = req.user._id;

  let seller = await Seller.findOne({ user: userId });
  const changes = [];

  if (seller) {
    const oldData = seller.toObject();
    
    if (oldData.businessName !== businessName) changes.push({ field: 'businessName', oldValue: oldData.businessName, newValue: businessName });
    if (oldData.gstNumber !== gstNumber) changes.push({ field: 'gstNumber', oldValue: oldData.gstNumber, newValue: gstNumber });
    if (oldData.panNumber !== panNumber) changes.push({ field: 'panNumber', oldValue: oldData.panNumber, newValue: panNumber });

    changes.push(...getChangedFields(oldData.address, address).map(c => ({...c, field: `address.${c.field}`})));
    changes.push(...getChangedFields(oldData.verificationDocuments, verificationDocuments).map(c => ({...c, field: `documents.${c.field}`})));
    
    seller.businessName = businessName;
    seller.gstNumber = gstNumber;
    seller.panNumber = panNumber;
    seller.address = address;
    seller.verificationDocuments = verificationDocuments;
    seller.status = 'pending';
    
  } else {
    seller = new Seller({
      user: userId,
      businessName,
      gstNumber,
      panNumber,
      address,
      verificationDocuments,
    });
  }
  
  const savedSeller = await seller.save();

  if (changes.length > 0 && !seller.isNew) {
      await SellerHistory.create({
          sellerId: savedSeller._id,
          changedBy: userId,
          changes,
          notes: 'Profile updated by seller.'
      });
  } else if (seller.isNew) {
       await SellerHistory.create({ sellerId: savedSeller._id, changedBy: userId, changes: [], notes: 'Seller profile created and submitted for approval.' });
  }

  await User.findByIdAndUpdate(userId, { sellerProfile: savedSeller._id });

  res.status(200).json(savedSeller);
});

// @desc    Get current seller's dashboard (profile and products)
// @route   GET /api/sellers/dashboard
// @access  Private/Seller
const getSellerDashboard = asyncHandler(async (req, res) => {
    // ... existing code ...
  const seller = await Seller.findOne({ user: req.user._id });

  if (!seller) {
    return res.status(200).json(null); // Return null instead of 404 to allow frontend to handle gracefully
  }

  res.status(200).json(seller);
});

// @desc    Get all products for the currently logged-in seller
// @route   GET /api/sellers/products
// @access  Private/Seller
const getSellerProducts = asyncHandler(async (req, res) => {
    // ... existing code ...
    const seller = await Seller.findOne({ user: req.user._id });

    if (!seller) {
        return res.json([]);
    }

    const products = await Product.find({ seller: req.user._id });

    res.status(200).json(products);
});

// @desc    Get analytics for the current seller
// @route   GET /api/sellers/analytics
// @access  Private/Seller
const getSellerAnalytics = asyncHandler(async (req, res) => {
    const products = await Product.find({ seller: req.user._id });

    if (!products) {
        return res.json({
            totalViews: 0,
            totalClicks: 0,
            conversionRate: 0,
            topProducts: [],
            performanceData: [],
        });
    }

    const totalViews = products.reduce((acc, p) => acc + p.viewCount, 0);
    const totalClicks = products.reduce((acc, p) => acc + p.clickCount, 0);
    const conversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    const topProducts = [...products]
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5);

    const performanceData = products.map(p => ({
        name: p.name,
        views: p.viewCount,
        clicks: p.clickCount,
    }));
    
    res.json({
        totalViews,
        totalClicks,
        conversionRate,
        topProducts,
        performanceData,
    });
});


module.exports = {
  enrollSeller,
  getSellerDashboard,
  getSellerProducts,
  getSellerAnalytics,
};
