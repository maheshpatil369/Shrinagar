// /Backend/controllers/productController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const Product = require('../models/productModel.js');
const User = require('../models/userModel.js');

// @desc    Fetch all APPROVED products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'approved' });
  res.json(products);
});

// @desc    Fetch ALL products for admin view
// @route   GET /api/products/all
// @access  Private/Admin
const getAllProductsForAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('seller', 'name');
  res.json(products);
});

// @desc    Fetch seller's own products
// @route   GET /api/products/myproducts
// @access  Private/Seller
const getMyProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ seller: req.user._id });
    res.json(products);
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public (with checks)
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (product) {
    const isOwner = req.user && product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (product.status === 'approved' || isOwner || isAdmin) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found or not approved');
    }
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = asyncHandler(async (req, res) => {
  const { 
    name, price, description, brand, category, material, images, affiliateUrl 
  } = req.body;

  if (!name || !price || !description || !brand || !category || !material || !images || !affiliateUrl) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const product = new Product({
    name,
    price,
    seller: req.user._id,
    brand,
    category,
    description,
    material,
    images,
    affiliateUrl,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller or Private/Admin
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
    product.images = images || product.images;
    product.affiliateUrl = affiliateUrl || product.affiliateUrl;

    // Only admin can change the status
    if (isAdmin && status) {
        product.status = status;
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
// @access  Private/Seller or Private/Admin
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


module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts,
    getAllProductsForAdmin,
};
