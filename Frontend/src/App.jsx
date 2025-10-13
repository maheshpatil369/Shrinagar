import React, { useState } from 'react';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SellerEnrollmentPage from './pages/SellerEnrollmentPage.jsx';
import SellerDashboard from './components/seller/SellerDashboard.jsx'; // Corrected: Import component directly
import AdminPanelPage from './pages/AdminPanelPage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Spinner from './components/common/Spinner.jsx';

const App = () => {
    const [page, setPage] = useState({ name: 'home' });
    const { loading } = useAuth();

    // Main router logic to render the correct page
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
            // Corrected: Render the SellerDashboard component directly
            case 'sellerDashboard':
                return <SellerDashboard setPage={setPage} />;
            case 'adminPanel':
                return <AdminPanelPage setPage={setPage} />;
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    // Show a global spinner while auth state is being determined
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
            <main className="flex-grow container mx-auto px-4 py-8">
                {renderPage()}
            </main>
            <Footer />
        </div>
    );
};

export default App;
