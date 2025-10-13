import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';

const LoginPage = ({ setPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      // Navigate to the appropriate dashboard based on user role
      if (user?.role === 'admin') {
        setPage({ name: 'adminPanel' });
      } else if (user?.isSeller) {
        setPage({ name: 'sellerDashboard' });
      } else {
        setPage({ name: 'home' });
      }
    } catch (err) {
      // The error message from our apiClient is caught here
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg z-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Spinner /> : 'Sign in'}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <a href="#" onClick={() => setPage({ name: 'register' })} className="font-medium text-indigo-600 hover:text-indigo-500">
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
