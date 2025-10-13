// FILENAME: src/pages/HomePage.jsx
//
// This is the main landing page for the application. It features a hero
// section and a grid of featured products to draw the user in.

import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import Spinner from '../components/common/Spinner.jsx';

// Mock data to simulate featured products from an API call
const mockFeaturedProducts = [
  { _id: '1', name: 'Seraphina Diamond Ring', price: 1250, images: ['https://placehold.co/600x600/f0e9e9/333?text=Ring'] },
  { _id: '2', name: 'Azure Teardrop Necklace', price: 890, images: ['https://placehold.co/600x600/f0e9e9/333?text=Necklace'] },
  { _id: '3', name: 'Orion Pearl Earrings', price: 450, images: ['https://placehold.co/600x600/f0e9e9/333?text=Earrings'] },
  { _id: '4', name: 'Helios Gold Bangle', price: 1800, images: ['https://placehold.co/600x600/f0e9e9/333?text=Bangle'] },
];

const HomePage = ({ setPage }) => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, you would fetch featured products from your API:
        // apiClient.get('/api/products?featured=true').then(response => { ... });
        setTimeout(() => { // Simulating network delay
            setFeaturedProducts(mockFeaturedProducts);
            setIsLoading(false);
        }, 1000);
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <div className="relative bg-stone-200 h-[60vh] flex items-center">
                <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611652033959-8a5549d41d24?q=80&w=2940&auto=format&fit=crop')" }}></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-4" style={{fontFamily: "'Playfair Display', serif"}}>The Original Shine Bright</h1>
                    <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">Discover exquisite jewellery, crafted with passion and precision. Find your next timeless piece today.</p>
                    <Button onClick={() => setPage({ name: 'products' })}>Discover Now</Button>
                </div>
            </div>

            {/* Featured Products Section */}
            <div className="container mx-auto px-6 py-16">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-12" style={{fontFamily: "'Playfair Display', serif"}}>Featured Collection</h2>
                {isLoading ? (
                    <Spinner />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {featuredProducts.map(product => (
                            <ProductCard key={product._id} product={product} setPage={setPage} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;

