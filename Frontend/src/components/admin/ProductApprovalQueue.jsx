// FILENAME: src/components/admin/ProductApprovalQueue.jsx
//
// This component displays a list of products with a 'pending' status,
// allowing an administrator to approve or reject them before they go public.

import React, { useState, useEffect } from 'react';

// Mock data simulating pending products fetched from the API
const mockPendingProducts = [
    {
        _id: 'prod1',
        name: 'Helios Gold Bangle',
        seller: { businessName: 'Eternity Jewels' },
        category: 'bracelet',
        price: 1800,
    },
    {
        _id: 'prod2',
        name: 'Midnight Sapphire Ring',
        seller: { businessName: 'Gemstone Galore' },
        category: 'ring',
        price: 2200,
    }
];

const ProductApprovalQueue = () => {
    const [pendingProducts, setPendingProducts] = useState([]);

    useEffect(() => {
        // In a real application, fetch from: apiClient.get('/api/products?status=pending');
        setPendingProducts(mockPendingProducts);
    }, []);

    const handleApprove = (productId) => {
        alert(`Approving product ${productId}...`);
        // API call: apiClient.put(`/api/products/${productId}`, { status: 'approved' });
        setPendingProducts(prev => prev.filter(p => p._id !== productId));
    };

    const handleReject = (productId) => {
        alert(`Rejecting product ${productId}...`);
        // API call: apiClient.put(`/api/products/${productId}`, { status: 'rejected' });
        setPendingProducts(prev => prev.filter(p => p._id !== productId));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 p-6" style={{fontFamily: "'Playfair Display', serif"}}>Pending Product Approvals</h2>
            {pendingProducts.length === 0 ? (
                 <p className="px-6 pb-6 text-gray-500">No pending products to review.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingProducts.map(product => (
                                <tr key={product._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.seller.businessName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleApprove(product._id)} className="text-green-600 hover:text-green-900 font-semibold">Approve</button>
                                        <button onClick={() => handleReject(product._id)} className="text-red-600 hover:text-red-900 font-semibold">Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductApprovalQueue;
