// FILENAME: src/components/layout/Header.jsx
//
// This component is the main navigation bar for the site.
// It displays the logo, navigation links, and user-specific actions.
// It uses the useAuth hook to dynamically change its content based on the user's authentication state and role.

import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

// Icon Components (can be moved to a separate file later)
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const HeartIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>);
const Logo = ({ setPage }) => ( <a href="#" onClick={() => setPage({ name: 'home' })} className="text-3xl font-bold text-gray-800" style={{fontFamily: "'Playfair Display', serif"}}>Shringar</a> );

const Header = ({ setPage }) => {
    const { isAuthenticated, user, logout } = useAuth();
    
    return (
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Logo setPage={setPage} />
                <nav className="hidden md:flex items-center space-x-8 text-lg">
                    <a href="#" onClick={() => setPage({ name: 'home' })} className="text-gray-600 hover:text-green-600 transition-colors">Home</a>
                    <a href="#" onClick={() => setPage({ name: 'products' })} className="text-gray-600 hover:text-green-600 transition-colors">Products</a>
                </nav>
                <div className="flex items-center space-x-5">
                    <button className="text-gray-600 hover:text-green-600"><SearchIcon /></button>
                    <button className="text-gray-600 hover:text-green-600"><HeartIcon /></button>
                    
                    {isAuthenticated ? (
                        <div className="relative group">
                             <button className="text-gray-600 hover:text-green-600"><UserIcon /></button>
                             <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100">
                                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                    <p className="font-semibold">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</a>
                                {user?.role === 'customer' && <a href="#" onClick={() => setPage({ name: 'sellerEnrollment' })} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Become a Seller</a>}
                                {user?.role === 'seller' && <a href="#" onClick={() => setPage({ name: 'sellerDashboard' })} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Seller Dashboard</a>}
                                {user?.role === 'admin' && <a href="#" onClick={() => setPage({ name: 'adminPanel' })} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Panel</a>}
                                <a href="#" onClick={() => { logout(); setPage({ name: 'home' }); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t">Logout</a>
                            </div>
                        </div>
                    ) : (
                         <button onClick={() => setPage({ name: 'login' })} className="text-gray-600 hover:text-green-600"><UserIcon /></button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

