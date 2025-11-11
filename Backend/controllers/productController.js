// maheshpatil369/shrinagar/Shrinagar-5f116f4d15321fb5db89b637c78651e13d353027/Backend/controllers/productController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const Product = require('../models/productModel.js');
const ProductView = require('../models/productViewModel.js'); // For accurate view tracking
const { getClientIp } = require('../utils/ipHelper.js'); // For accurate view tracking

// @desc    Fetch all APPROVED products with filtering and search
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, brand, material, minPrice, maxPrice, ids } = req.query;
  let query = { status: 'approved' };

  if (ids) {
    const idArray = ids.split(',');
    query = { _id: { $in: idArray } };
  } else {
    if (keyword) {
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
  }

  const products = await Product.find(query).populate({
    path: 'seller',
    select: 'name sellerProfile',
    populate: {
      path: 'sellerProfile',
      select: 'businessName'
    }
  });
  res.json(products);
});


// @desc    Fetch single product by ID and increment view count
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate({
      path: 'seller',
      select: 'name sellerProfile',
      populate: {
        path: 'sellerProfile',
        select: 'businessName'
      }
    });

    if (product && product.status === 'approved') {
        const ipAddress = getClientIp(req);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const existingView = await ProductView.findOne({
            productId: product._id,
            ipAddress: ipAddress,
            viewedAt: { $gte: twentyFourHoursAgo },
        });

        if (!existingView) {
            await ProductView.create({ productId: product._id, ipAddress: ipAddress, userId: req.user?._id });
            product.viewCount = (product.viewCount || 0) + 1;
            await product.save();
        }
        
        // Fetch recommendations (4 other approved products in the same category)
        const recommendations = await Product.find({
            category: product.category,
            status: 'approved',
            _id: { $ne: product._id } // Exclude the current product
        })
        .limit(4) // Limit the number of recommendations
        .populate({
            path: 'seller',
            select: 'name sellerProfile',
            populate: {
                path: 'sellerProfile',
                select: 'businessName'
            }
        });

        res.json({ product, recommendations });

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
  
  const productImages = Array.isArray(images) ? images : images.split(',').map(img => img.trim()).filter(Boolean);

  const product = new Product({
    name,
    price,
    seller: req.user._id,
    brand,
    category,
    description,
    material,
    images: productImages,
    affiliateUrl,
    status: 'pending',
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
    product.images = Array.isArray(images) ? images : images.split(',').map(img => img.trim()).filter(Boolean);
    product.affiliateUrl = affiliateUrl || product.affiliateUrl;
    product.status = 'pending';

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

// --- NEW: Controller to create a product review ---
// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});
// --- End of new controller ---

module.exports = {
    getProducts,
    getProductById,
    getTrendingProducts,
    trackAffiliateClick,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts,
    createProductReview, // Add new export
};