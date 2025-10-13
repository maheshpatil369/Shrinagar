// FILENAME: src/components/layout/Footer.jsx
//
// This is the site-wide footer. It contains contact information,
// navigation links, and social media icons, mirroring the "Shofy" example.

import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Brand and Contact */}
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{fontFamily: "'Playfair Display', serif"}}>Shringar</h2>
                        <p className="text-gray-600 mb-4">
                            The finest curated jewellery from the world's best artisans, delivered to you.
                        </p>
                        <p className="text-gray-600"><span className="font-semibold">Email:</span> contact@shringar.com</p>
                        <p className="text-gray-600"><span className="font-semibold">Phone:</span> +91 22 1234 5678</p>
                    </div>

                    {/* Column 2: My Account */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Account</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Track Orders</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Shipping</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Wishlist</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">My Account</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Order History</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Information</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Our Story</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Careers</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Terms & Conditions</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Subscribe */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscribe</h3>
                        <p className="text-gray-600 mb-4">Enter your email to get notified about new collections and sales.</p>
                        <div className="flex">
                            <input type="email" placeholder="Your Email" className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                            <button className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-200 pt-6 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Shringar. All Rights Reserved. </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
