// FILENAME: src/components/common/Button.jsx
//
// A general-purpose, reusable button component styled with Tailwind CSS.
// It accepts different variants for primary and secondary actions,
// and can show a loading state.

import React from 'react';
import Spinner from './Spinner.jsx'; // We'll create this next

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', isLoading = false, disabled = false }) => {
    const baseStyles = 'w-full flex justify-center items-center px-8 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        secondary: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 focus:ring-green-500',
    };

    const disabledStyles = 'opacity-50 cursor-not-allowed';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`${baseStyles} ${variants[variant]} ${className} ${isLoading || disabled ? disabledStyles : ''}`}
        >
            {isLoading ? <Spinner size="sm" /> : children}
        </button>
    );
};

export default Button;

