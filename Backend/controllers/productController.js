// maheshpatil369/shrinagar/Shrinagar-abcbe203037457af5cdd1912b6e3260dabf070c5/Backend/controllers/productController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const Product = require('../models/productModel.js');
const ProductView = require('../models/productViewModel.js'); // For accurate view tracking
const { getClientIp } = require('../utils/ipHelper.js'); // For accurate view tracking

// @desc    Fetch all APPROVED products with filtering and search
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, brand, material, minPrice, maxPrice } = req.query;
  const query = { status: 'approved' };

  if (keyword) {
    // Using an object that can be expanded into the query
    const searchOr = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
    ];
    query.$or = searchOr;
  }
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (material) query.material = material;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(query).populate('seller', 'name');
  res.json(products);
});


// @desc    Fetch single product by ID and increment view count
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');

    // Only count views for approved products that are found
    if (product && product.status === 'approved') {
        // --- Accurate View Tracking Logic ---
        const ipAddress = getClientIp(req);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Check if this IP has viewed this product in the last 24 hours
        const existingView = await ProductView.findOne({
            productId: product._id,
            ipAddress: ipAddress,
            viewedAt: { $gte: twentyFourHoursAgo },
        });

        // If no recent view is found, create one and increment the count
        if (!existingView) {
            await ProductView.create({ productId: product._id, ipAddress: ipAddress, userId: req.user?._id });
            product.viewCount = (product.viewCount || 0) + 1;
            await product.save();
        }
        // --- End View Tracking ---
        
        res.json(product);

    } else {
        res.status(404);
        throw new Error('Product not found or not approved');
    }
});

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
const getTrendingProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ status: 'approved' })
        .sort({ viewCount: -1, clickCount: -1 })
        .limit(8)
        .populate('seller', 'name');
    res.json(products);
});


// @desc    Track a click on an affiliate link
// @route   POST /api/products/:id/track-click
// @access  Public
const trackAffiliateClick = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        product.clickCount = (product.clickCount || 0) + 1;
        await product.save();
        res.status(200).json({ message: 'Click tracked' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});


// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, brand, category, material, images, affiliateUrl } = req.body;
  const product = new Product({
    name,
    price,
    seller: req.user._id,
    brand,
    category,
    description,
    material,
    images: images.split(',').map(img => img.trim()).filter(Boolean), // Handle comma-separated string
    affiliateUrl,
    status: 'pending', // Always pending on creation
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});


// @desc    Update a product by its owner
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, brand, category, material, images, affiliateUrl } = req.body;
  const product = await Product.findById(req.params.id);

  if (product && product.seller.toString() === req.user._id.toString()) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.material = material || product.material;
    // Handle both array and comma-separated string for images
    product.images = Array.isArray(images) ? images : images.split(',').map(img => img.trim()).filter(Boolean);
    product.affiliateUrl = affiliateUrl || product.affiliateUrl;
    product.status = 'pending'; // Re-submit for approval on update

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found or user not authorized');
  }
});


// @desc    Delete a product by its owner
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product && product.seller.toString() === req.user._id.toString()) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found or user not authorized');
  }
});


// @desc    Get all products for the currently logged-in seller
// @route   GET /api/products/myproducts
// @access  Private/Seller
const getMyProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ seller: req.user._id });
    res.json(products);
});

module.exports = {
    getProducts,
    getProductById,
    getTrendingProducts,
    trackAffiliateClick,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts,
};
