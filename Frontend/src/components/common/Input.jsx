// FILENAME: src/components/common/Input.jsx
//
// A reusable input field component for forms.
// It includes a label and is styled with Tailwind CSS for a consistent look.

import React from 'react';

const Input = ({ id, label, type = 'text', placeholder, value, onChange, required = false }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
        </div>
    );
};

export default Input;
