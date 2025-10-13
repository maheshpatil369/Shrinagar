// FILENAME: src/components/seller/SellerDashboard.jsx
//
// This is the main dashboard for a logged-in seller. It displays analytics,
// a list of their products, and provides an entry point to add new products.

import React, { useState, useEffect } from 'react';

// Mock data simulating products fetched for this seller
const mockSellerProducts = [
    { _id: '1', name: 'Seraphina Diamond Ring', status: 'approved', views: 1024, clicks: 58 },
    { _id: '4', name: 'Helios Gold Bangle', status: 'pending', views: 256, clicks: 12 },
    { _id: '7', name: 'Ruby Radiance Ring', status: 'rejected', views: 50, clicks: 2 },
];

const SellerDashboard = ({ setPage }) => {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ totalProducts: 0, totalViews: 0, totalClicks: 0 });

    useEffect(() => {
        // In a real app, you would fetch the seller's products and stats from the API
        // For example: apiClient.get('/api/sellers/dashboard/products');
        setProducts(mockSellerProducts);
        
        // Calculate stats from the products
        const totalViews = mockSellerProducts.reduce((sum, p) => sum + p.views, 0);
        const totalClicks = mockSellerProducts.reduce((sum, p) => sum + p.clicks, 0);
        setStats({ totalProducts: mockSellerProducts.length, totalViews, totalClicks });
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: "'Playfair Display', serif"}}>Seller Dashboard</h1>
                <button 
                    onClick={() => setPage({ name: 'addProduct' })} // We will need a page for the product form
                    className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition-colors"
                >
                    + Add New Product
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Total Views</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Affiliate Clicks</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalClicks.toLocaleString()}</p>
                </div>
            </div>

            {/* Product List Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <h2 className="text-2xl font-semibold text-gray-800 p-6" style={{fontFamily: "'Playfair Display', serif"}}>Your Products</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.views}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.clicks}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href="#" className="text-green-600 hover:text-green-900">Edit</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
