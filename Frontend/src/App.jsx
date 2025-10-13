// FILENAME: src/App.jsx
//
// This is the main application component. It acts as a client-side router,
// rendering the correct page based on the current state. It also wraps all
// content in the Header and Footer for a consistent layout.

import React, { useState } from 'react';

// Import Layout Components
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';

// Import All Page Components
import HomePage from './pages/HomePage.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SellerEnrollmentPage from './pages/SellerEnrollmentPage.jsx';
import SellerDashboardPage from './pages/SellerDashboardPage.jsx';
import AdminPanelPage from './pages/AdminPanelPage.jsx';

// Import Authentication Context
import { useAuth } from './context/AuthContext.jsx';
import Spinner from './components/common/Spinner.jsx';


const App = () => {
    // State to manage the current page and any data needed for that page (like a product ID)
    // The state is an object, e.g., { name: 'productDetail', props: { productId: '123' } }
    const [page, setPage] = useState({ name: 'home' });
    const { loading } = useAuth();

    // This function renders the correct page component based on the `page.name` state
    const renderPage = () => {
        switch (page.name) {
            case 'home':
                return <HomePage setPage={setPage} />;
            case 'products':
                return <ProductListPage setPage={setPage} />;
            case 'productDetail':
                return <ProductDetailPage setPage={setPage} productId={page.props.productId} />;
            case 'login':
                return <LoginPage setPage={setPage} />;
            case 'register':
                return <RegisterPage setPage={setPage} />;
            case 'sellerEnrollment':
                return <SellerEnrollmentPage setPage={setPage} />;
            case 'sellerDashboard':
                return <SellerDashboardPage setPage={setPage} />;
            case 'adminPanel':
                return <AdminPanelPage setPage={setPage} />;
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    // While the AuthContext is checking for a token, show a loading spinner
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header setPage={setPage} />
            <main className="flex-grow">
                {renderPage()}
            </main>
            <Footer />
        </div>
    );
};

export default App;

