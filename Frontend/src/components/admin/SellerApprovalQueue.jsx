// FILENAME: src/components/admin/SellerApprovalQueue.jsx
//
// This component displays a list of sellers with a 'pending' status,
// allowing an administrator to approve or reject their applications.

import React, { useState, useEffect } from 'react';

// Mock data simulating pending seller applications fetched from the API
const mockPendingSellers = [
    { 
        _id: 'seller1', 
        businessName: 'Elegant Gems', 
        user: { name: 'Test Seller', email: 'seller@example.com' },
        gstNumber: '22ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
    },
    { 
        _id: 'seller2', 
        businessName: 'Antique Jewels Co.', 
        user: { name: 'Jane Doe', email: 'jane.d@example.com' },
        gstNumber: '29FGHIJ5678K1Z9',
        panNumber: 'FGHIJ5678K',
    },
];

const SellerApprovalQueue = () => {
    const [pendingSellers, setPendingSellers] = useState([]);

    useEffect(() => {
        // In a real application, you would fetch this data from your backend:
        // apiClient.get('/api/sellers?status=pending');
        setPendingSellers(mockPendingSellers);
    }, []);

    const handleApprove = (sellerId) => {
        alert(`Approving seller ${sellerId}...`);
        // API call: apiClient.put(`/api/sellers/${sellerId}/status`, { status: 'approved' });
        setPendingSellers(prev => prev.filter(s => s._id !== sellerId));
    };

    const handleReject = (sellerId) => {
        alert(`Rejecting seller ${sellerId}...`);
        // API call: apiClient.put(`/api/sellers/${sellerId}/status`, { status: 'rejected' });
        setPendingSellers(prev => prev.filter(s => s._id !== sellerId));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <h2 className="text-2xl font-semibold text-gray-800 p-6" style={{fontFamily: "'Playfair Display', serif"}}>Pending Seller Approvals</h2>
            {pendingSellers.length === 0 ? (
                <p className="px-6 pb-6 text-gray-500">No pending seller applications.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Number</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingSellers.map(seller => (
                                <tr key={seller._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{seller.businessName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.gstNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleApprove(seller._id)} className="text-green-600 hover:text-green-900 font-semibold">Approve</button>
                                        <button onClick={() => handleReject(seller._id)} className="text-red-600 hover:text-red-900 font-semibold">Reject</button>
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

export default SellerApprovalQueue;
