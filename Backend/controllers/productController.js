// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Backend/controllers/productController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const Product = require('../models/productModel.js');
const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');

// @desc    Fetch all APPROVED products with filtering and search
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, brand, material, minPrice, maxPrice } = req.query;

  const query = { status: 'approved' };

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (category) {
    query.category = category;
  }
  if (brand) {
    query.brand = brand;
  }
  if (material) {
    query.material = material;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = Number(maxPrice);
    }
  }

  const products = await Product.find(query).populate('seller', 'name');
  res.json(products);
});

// @desc    Fetch single product by ID and increment view count
// @route   GET /api/products/:id
// @access  Public (with auth checks for non-approved items)
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Public users and all users can see approved products
  if (product.status === 'approved') {
    // Increment view count but don't wait for it to complete
    Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();
    return res.json(product);
  }

  // For non-approved products, we need to check if the user is authorized
  let user = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token failed, treat as public user.
    }
  }

  const isOwner = user && product.seller && product.seller._id.toString() === user._id.toString();
  const isAdmin = user && user.role === 'admin';

  if (isOwner || isAdmin) {
    return res.json(product);
  }
  
  res.status(404);
  throw new Error('Product not found or not available');
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


// ... (createProduct, updateProduct, deleteProduct, getMyProducts, getAllProductsForAdmin remain the same)
const createProduct = asyncHandler(async (req, res) => {
  const { 
    name, price, description, brand, category, material, images, affiliateUrl 
  } = req.body;

  if (!name || !price || !description || !brand || !category || !material || !images || !affiliateUrl) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Ensure images is an array
  const imagesArray = Array.isArray(images) ? images : images.split(',').map(img => img.trim()).filter(img => img);

  const product = new Product({
    name,
    price,
    seller: req.user._id,
    brand,
    category,
    description,
    material,
    images: imagesArray,
    affiliateUrl,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, brand, category, material, images, affiliateUrl, status } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const isOwner = product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('User not authorized to update this product');
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.material = material || product.material;
    
    if (images) {
       product.images = Array.isArray(images) ? images : images.split(',').map(img => img.trim()).filter(img => img);
    }
    
    product.affiliateUrl = affiliateUrl || product.affiliateUrl;

    if (isAdmin && status) {
        product.status = status;
        // Optionally, send a notification upon status change
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const isOwner = product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('User not authorized to delete this product');
    }

    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});


const getMyProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ seller: req.user._id });
    res.json(products);
});

const getAllProductsForAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('seller', 'name');
  res.json(products);
});


module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts,
    getAllProductsForAdmin,
    trackAffiliateClick,
};

