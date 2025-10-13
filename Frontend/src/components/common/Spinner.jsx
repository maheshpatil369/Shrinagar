// FILENAME: src/components/common/Spinner.jsx
//
// A simple loading spinner component to provide visual feedback
// during asynchronous operations like fetching data.

import React from 'react';

const Spinner = ({ size = 'md' }) => {
    const sizes = {
        sm: 'w-5 h-5 border-2',
        md: 'w-10 h-10 border-4',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className={`
            ${sizes[size]} 
            border-dashed rounded-full animate-spin border-white mx-auto
            ${size !== 'sm' ? 'border-green-500' : ''}
        `}>
        </div>
    );
};

export default Spinner;
