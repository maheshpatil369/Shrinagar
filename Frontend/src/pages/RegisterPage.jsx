// FILENAME: src/pages/RegisterPage.jsx
//
// This page allows new users to create an account. It handles form submission
// and uses the AuthContext for registration.

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';

const RegisterPage = ({ setPage }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await register(name, email, password);
        setIsLoading(false);

        if (result.success) {
            setPage({ name: 'home' }); // Redirect to home after successful registration
        } else {
            setError(result.message || 'Failed to register. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 flex justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-800" style={{fontFamily: "'Playfair Display', serif"}}>Create an Account</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        id="name"
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <Input
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Spinner /> : 'Create Account'}
                        </Button>
                    </div>
                </form>

                <p className="text-sm text-center text-gray-600">
                    Already have an account?{' '}
                    <a href="#" onClick={() => setPage({ name: 'login' })} className="font-medium text-green-600 hover:underline">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;

