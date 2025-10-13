// Backend/controllers/productController.js
import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'approved' });
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product && product.status === 'approved') {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, images, affiliateUrl } = req.body;

  const product = new Product({
    name,
    description,
    price,
    category,
    images,
    affiliateUrl,
    seller: req.user._id, // from protect middleware
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, images, affiliateUrl } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // Check if the user is the seller of the product
        if (product.seller.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this product');
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.images = images || product.images;
        product.affiliateUrl = affiliateUrl || product.affiliateUrl;
        product.status = 'pending'; // Require re-approval after edit

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});


// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
         // Check if the user is the seller of the product
        if (product.seller.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this product');
        }
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});


// @desc    Get pending products for admin approval
// @route   GET /api/products/pending
// @access  Private/Admin
const getPendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'pending' }).populate('seller', 'name email');
  res.json(products);
});

// @desc    Approve a product
// @route   PUT /api/products/:id/approve
// @access  Private/Admin
const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.status = 'approved';
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});


export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPendingProducts,
  approveProduct,
};
