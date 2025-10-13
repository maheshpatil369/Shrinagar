// FILENAME: src/pages/AdminPanelPage.jsx
//
// This is the main control panel for administrators. It provides an interface
// for managing seller and product approval queues.

import React, { useState } from 'react';
import SellerApprovalQueue from '../components/admin/SellerApprovalQueue.jsx';
import ProductApprovalQueue from '../components/admin/ProductApprovalQueue.jsx';

const AdminPanelPage = () => {
    const [activeTab, setActiveTab] = useState('sellers'); // 'sellers' or 'products'

    const tabStyles = "px-6 py-3 text-lg font-medium leading-5 rounded-t-lg focus:outline-none";
    const activeTabStyles = "text-green-600 bg-white border-b-2 border-green-500";
    const inactiveTabStyles = "text-gray-500 hover:text-gray-700 hover:bg-gray-50";

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-8" style={{fontFamily: "'Playfair Display', serif"}}>Admin Panel</h1>
            
            <div className="w-full">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('sellers')}
                        className={`${tabStyles} ${activeTab === 'sellers' ? activeTabStyles : inactiveTabStyles}`}
                    >
                        Seller Approvals
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`${tabStyles} ${activeTab === 'products' ? activeTabStyles : inactiveTabStyles}`}
                    >
                        Product Approvals
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-8">
                    {activeTab === 'sellers' && <SellerApprovalQueue />}
                    {activeTab === 'products' && <ProductApprovalQueue />}
                </div>
            </div>
        </div>
    );
};

export default AdminPanelPage;

