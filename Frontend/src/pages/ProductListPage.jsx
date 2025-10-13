// FILENAME: src/pages/ProductListPage.jsx
//
// This page displays a grid of all available products and includes
// a sidebar for filtering the results.

import React, { useState, useEffect } from 'react';
import ProductCard from '../components/product/ProductCard.jsx';
import FilterSidebar from '../components/product/FilterSidebar.jsx';
import Spinner from '../components/common/Spinner.jsx';

// Mock data to simulate all products from an API call
const mockAllProducts = [
  { _id: '1', name: 'Seraphina Diamond Ring', price: 1250, category: 'ring', images: ['https://placehold.co/600x600/f0e9e9/333?text=Ring'] },
  { _id: '2', name: 'Azure Teardrop Necklace', price: 890, category: 'necklace', images: ['https://placehold.co/600x600/f0e9e9/333?text=Necklace'] },
  { _id: '3', name: 'Orion Pearl Earrings', price: 450, category: 'earrings', images: ['https://placehold.co/600x600/f0e9e9/333?text=Earrings'] },
  { _id: '4', name: 'Helios Gold Bangle', price: 1800, category: 'bracelet', images: ['https://placehold.co/600x600/f0e9e9/333?text=Bangle'] },
  { _id: '5', name: 'Emerald City Studs', price: 760, category: 'earrings', images: ['https://placehold.co/600x600/f0e9e9/333?text=Studs'] },
  { _id: '6', name: 'Celestial Pendant', price: 620, category: 'necklace', images: ['https://placehold.co/600x600/f0e9e9/333?text=Pendant'] },
];

const ProductListPage = ({ setPage }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch all approved products from your API:
        // apiClient.get('/api/products').then(response => { ... });
        setTimeout(() => { // Simulating network delay
            setProducts(mockAllProducts);
            setFilteredProducts(mockAllProducts);
            setIsLoading(false);
        }, 1000);
    }, []);

    const handleFilterChange = (filters) => {
        // This is a simple client-side filter. In a real app, you might
        // send these filters to the backend API to get filtered results.
        // For example: apiClient.get('/api/products', { params: filters });
        let tempProducts = [...products];

        if (filters.category && filters.category !== 'all') {
            tempProducts = tempProducts.filter(p => p.category === filters.category);
        }

        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(Number);
            tempProducts = tempProducts.filter(p => p.price >= min && p.price <= max);
        }
        
        setFilteredProducts(tempProducts);
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-12" style={{fontFamily: "'Playfair Display', serif"}}>Our Collection</h1>
            <div className="flex flex-col md:flex-row gap-12">
                <aside className="w-full md:w-1/4">
                    <FilterSidebar onFilterChange={handleFilterChange} />
                </aside>
                <main className="w-full md:w-3/4">
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <ProductCard key={product._id} product={product} setPage={setPage} />
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-500">No products match your criteria.</p>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductListPage;

