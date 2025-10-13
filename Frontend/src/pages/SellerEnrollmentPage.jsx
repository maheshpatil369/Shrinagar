// FILENAME: src/pages/SellerEnrollmentPage.jsx
//
// This page contains a form for registered users to apply to become sellers.
// It submits their business information to the backend for admin approval.

import React, { useState } from 'react';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';

const SellerEnrollmentPage = ({ setPage }) => {
    const [formData, setFormData] = useState({
        businessName: '',
        gstNumber: '',
        panNumber: '',
        address: { street: '', city: '', state: '', pincode: '' },
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        // In a real app, you would make an API call here:
        // const result = await apiClient.post('/api/sellers/enroll', formData);
        console.log("Submitting seller application:", formData);
        
        setTimeout(() => { // Simulating API call
            setIsLoading(false);
            setMessage('Your application has been submitted for review. You will be notified upon approval.');
        }, 1500);
    };

    return (
        <div className="container mx-auto px-6 py-12 flex justify-center">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-800" style={{fontFamily: "'Playfair Display', serif"}}>Become a Seller</h1>
                <p className="text-center text-gray-600">Fill out the form below to sell your products on our platform. Your application will be reviewed by an administrator.</p>

                {message ? (
                    <div className="p-4 text-center bg-green-100 text-green-800 rounded-lg">{message}</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input id="businessName" label="Business Name" value={formData.businessName} onChange={handleChange} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input id="gstNumber" label="GST Number" value={formData.gstNumber} onChange={handleChange} required />
                            <Input id="panNumber" label="PAN Number" value={formData.panNumber} onChange={handleChange} required />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-700 pt-4 border-t">Business Address</h2>
                        <Input id="street" label="Street Address" name="street" value={formData.address.street} onChange={handleAddressChange} required />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <Input id="city" label="City" name="city" value={formData.address.city} onChange={handleAddressChange} required />
                             <Input id="state" label="State" name="state" value={formData.address.state} onChange={handleAddressChange} required />
                             <Input id="pincode" label="Pincode" name="pincode" value={formData.address.pincode} onChange={handleAddressChange} required />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Spinner /> : 'Submit Application'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SellerEnrollmentPage;

