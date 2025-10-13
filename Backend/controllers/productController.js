// shringar-backend/controllers/productController.js

const Product = require('../models/productModel');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  // Implement filtering and searching
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i', // case-insensitive
        },
      }
    : {};

  // Only show approved products to the public
  const products = await Product.find({ ...keyword, status: 'approved' }).populate('seller', 'businessName');
  res.json(products);
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', 'businessName rating');
  if (product && product.status === 'approved') {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found or not approved');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller or Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        ...req.body,
        seller: req.user.id // Link the product to the logged-in user
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});


// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin or Private/Seller
exports.updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, images, brand, category, inStock, featured, status, material, affiliateUrl } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Authorization check: Only admin or the product's seller can update
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized to update this product');
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.material = material || product.material;
    product.affiliateUrl = affiliateUrl || product.affiliateUrl;
    product.inStock = inStock === undefined ? product.inStock : inStock;

    // Admin-only updates for featuring and status
    if (req.user.role === 'admin') {
        product.featured = featured === undefined ? product.featured : featured;
        product.status = status || product.status;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update product view count
// @route   POST /api/products/:id/view
// @access  Public
exports.updateProductViews = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.json({ message: 'View count updated', views: product.views });
});

// @desc    Update product click count
// @route   POST /api/products/:id/click
// @access  Public
exports.updateProductClicks = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } }, { new: true });
     if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.json({ message: 'Click count updated', clicks: product.clicks });
});
