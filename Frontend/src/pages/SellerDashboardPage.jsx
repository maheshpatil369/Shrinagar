// FILENAME: src/pages/SellerDashboardPage.jsx
//
// This is the main dashboard for sellers. It provides an overview of their
// products and analytics. It will use the SellerDashboard component.

import React from 'react';
import SellerDashboard from '../components/seller/SellerDashboard.jsx';

const SellerDashboardPage = ({ setPage }) => {
    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-8" style={{fontFamily: "'Playfair Display', serif"}}>Seller Dashboard</h1>
            <SellerDashboard setPage={setPage} />
        </div>
    );
};

export default SellerDashboardPage;
