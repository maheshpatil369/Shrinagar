// FILENAME: src/pages/LoginPage.jsx
//
// This page provides a form for users to log in. It uses the AuthContext
// to handle the authentication logic and redirects the user upon success.

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';

const LoginPage = ({ setPage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            // Navigate to home page or dashboard based on role after successful login
            setPage({ name: 'home' });
        } else {
            setError(result.message || 'Failed to log in. Please check your credentials.');
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 flex justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-800" style={{fontFamily: "'Playfair Display', serif"}}>Login to Your Account</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Spinner /> : 'Login'}
                        </Button>
                    </div>
                </form>

                <p className="text-sm text-center text-gray-600">
                    Don't have an account?{' '}
                    <a href="#" onClick={() => setPage({ name: 'register' })} className="font-medium text-green-600 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

