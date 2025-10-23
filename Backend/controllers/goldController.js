// Backend/controllers/goldController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const axios = require('axios');

// @desc    Fetch live gold price
// @route   GET /api/gold/price
// @access  Public (or Private if you prefer)
const getGoldPrice = asyncHandler(async (req, res) => {
    const apiKey = process.env.GOLD_API_KEY;
    if (!apiKey) {
        res.status(500);
        throw new Error('Gold API key not configured on server.');
    }

    try {
        const response = await axios.get('https://www.goldapi.io/api/XAU/USD', {
            headers: {
                'x-access-token': apiKey,
                'Content-Type': 'application/json'
            }
        });

        // Extract relevant data (adjust if API response structure differs)
        const priceData = {
            price: response.data.price,
            currency: response.data.currency,
            timestamp: response.data.timestamp,
            // Add other fields you might want, like change percentage (chp)
            changePercent: response.data.chp
        };

        res.json(priceData);

    } catch (error) {
        console.error('Error fetching gold price:', error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500);
        throw new Error('Failed to fetch live gold price.');
    }
});

module.exports = { getGoldPrice };
