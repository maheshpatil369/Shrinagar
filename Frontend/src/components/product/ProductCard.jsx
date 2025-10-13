// FILENAME: src/components/product/ProductCard.jsx
//
// This component displays a single product in a grid view.
// It shows the product image, name, category, and price.
// Clicking on the card will navigate the user to the ProductDetailPage.

import React from 'react';

const ProductCard = ({ product, setPage }) => {
    const { _id, name, price, category, images } = product;

    const handleCardClick = () => {
        // Navigate to the detail page for this specific product
        setPage({ name: 'productDetail', productId: _id });
    };

    return (
        <div 
            className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden"
            onClick={handleCardClick}
        >
            <div className="relative w-full aspect-square overflow-hidden">
                <img
                    src={images[0] || 'https://placehold.co/600x600/f0e9e9/333?text=Jewellery'}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                />
            </div>
            <div className="p-4 text-center">
                <p className="text-sm text-gray-500 capitalize mb-1">{category}</p>
                <h3 className="text-lg font-semibold text-gray-800 truncate" style={{fontFamily: "'Playfair Display', serif"}}>
                    {name}
                </h3>
                <p className="mt-2 text-lg font-bold text-green-700">
                    ${price.toFixed(2)}
                </p>
            </div>
        </div>
    );
};

export default ProductCard;

