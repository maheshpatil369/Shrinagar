// Backend/controllers/goldController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const axios = require('axios');

// @desc    Fetch live metal price (Gold, Silver, Platinum)
// @route   GET /api/gold/:symbol
// @access  Public
const getMetalPrice = asyncHandler(async (req, res) => {
    const apiKey = process.env.GOLD_API_KEY;
    const { symbol } = req.params; // e.g., XAU, XAG, XPT
    const currency = 'INR'; // Fetching in INR as per sketch "Rs."

    // Map common names to symbols if needed, though frontend sends symbols
    const cleanSymbol = symbol ? symbol.toUpperCase() : 'XAU';

    // Mock data in case API key is missing or fails (to ensure UI doesn't break during demo)
    const mockData = {
        'XAU': { price: 62540, chp: 0.5 }, // Approx 10g price or per unit
        'XAG': { price: 750, chp: -0.2 },
        'XPT': { price: 3200, chp: 1.2 }
    };

    if (!apiKey) {
        console.warn("Gold API Key missing, serving mock data.");
        return res.json({
            symbol: cleanSymbol,
            price: mockData[cleanSymbol]?.price || 0,
            currency: currency,
            timestamp: Math.floor(Date.now() / 1000),
            changePercent: mockData[cleanSymbol]?.chp || 0
        });
    }

    try {
        // GoldAPI.io endpoint: https://www.goldapi.io/api/{symbol}/{currency}
        const response = await axios.get(`https://www.goldapi.io/api/${cleanSymbol}/${currency}`, {
            headers: {
                'x-access-token': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 5000 // 5s timeout
        });

        res.json({
            symbol: cleanSymbol,
            price: response.data.price,
            currency: response.data.currency,
            timestamp: response.data.timestamp,
            changePercent: response.data.chp
        });

    } catch (error) {
        console.error(`Error fetching ${cleanSymbol} price:`, error.message);
        // Return mock/fallback data on error so frontend doesn't break
        res.json({
            symbol: cleanSymbol,
            price: mockData[cleanSymbol]?.price || 0,
            currency: currency,
            timestamp: Math.floor(Date.now() / 1000),
            changePercent: mockData[cleanSymbol]?.chp || 0,
            error: true
        });
    }
});

module.exports = { getMetalPrice };