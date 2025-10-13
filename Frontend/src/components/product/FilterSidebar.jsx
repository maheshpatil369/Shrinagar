// FILENAME: src/components/product/FilterSidebar.jsx
//
// This component provides filtering options for the product list page.
// It allows users to filter by category and price range.

import React, { useState } from 'react';

const FilterSidebar = ({ onFilterChange }) => {
    const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
    const [selectedCategories, setSelectedCategories] = useState([]);

    const categories = ['ring', 'necklace', 'earrings', 'bracelet', 'other'];

    const handleCategoryChange = (category) => {
        const newCategories = selectedCategories.includes(category)
            ? selectedCategories.filter(c => c !== category)
            : [...selectedCategories, category];
        setSelectedCategories(newCategories);
        // In a real app, you would call onFilterChange here
    };

    // NOTE: A real implementation would likely debounce these inputs
    // or use a button to apply filters to avoid excessive API calls.
    const handlePriceChange = (e) => {
        setPriceRange({ ...priceRange, [e.target.name]: e.target.value });
    };

    return (
        <aside className="w-full md:w-64 lg:w-72 p-6 bg-stone-50 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6" style={{fontFamily: "'Playfair Display', serif"}}>Filters</h3>

            {/* Category Filter */}
            <div className="mb-8">
                <h4 className="font-semibold text-gray-700 mb-3">Category</h4>
                <ul className="space-y-2">
                    {categories.map(category => (
                        <li key={category}>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-gray-600 capitalize">{category}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Range Filter */}
            <div>
                <h4 className="font-semibold text-gray-700 mb-3">Price Range</h4>
                <div className="flex items-center space-x-3">
                    <div className="w-1/2">
                        <label htmlFor="min" className="text-sm text-gray-500">Min</label>
                        <input
                            type="number"
                            name="min"
                            id="min"
                            value={priceRange.min}
                            onChange={handlePriceChange}
                            className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="0"
                        />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="max" className="text-sm text-gray-500">Max</label>
                        <input
                            type="number"
                            name="max"
                            id="max"
                            value={priceRange.max}
                            onChange={handlePriceChange}
                             className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="5000"
                        />
                    </div>
                </div>
            </div>
            
             {/* Apply Button */}
             <button
                onClick={() => onFilterChange({ priceRange, categories: selectedCategories })}
                className="w-full mt-8 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
             >
                Apply
             </button>
        </aside>
    );
};

export default FilterSidebar;
    