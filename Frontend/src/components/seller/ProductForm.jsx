// FILENAME: src/components/seller/ProductForm.jsx
//
// A form for sellers to create or update their product listings.
// It will be used on both the "Add Product" and "Edit Product" pages.

import React, { useState } from 'react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

const ProductForm = ({ initialData = {}, onSubmit, isSubmitting }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category: initialData.category || 'ring',
        material: initialData.material || '',
        images: initialData.images || [''], // Start with one image URL input
        affiliateUrl: initialData.affiliateUrl || '',
        arModelUrl: initialData.arModelUrl || '',
    });

    const categories = ['ring', 'necklace', 'earrings', 'bracelet', 'other'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageInput = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
            <Input id="name" label="Product Name" value={formData.name} onChange={handleChange} required />
            
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="price" label="Price ($)" type="number" value={formData.price} onChange={handleChange} required />
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {categories.map(cat => <option key={cat} value={cat} className="capitalize">{cat}</option>)}
                    </select>
                </div>
            </div>
            
            <Input id="material" label="Material (e.g., 18k Gold)" value={formData.material} onChange={handleChange} required />
            <Input id="affiliateUrl" label="Affiliate Purchase URL" value={formData.affiliateUrl} onChange={handleChange} required />
            <Input id="arModelUrl" label="AR Model URL (Optional)" value={formData.arModelUrl} onChange={handleChange} />
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs</label>
                {formData.images.map((url, index) => (
                    <div key={index} className="mb-2">
                        <input
                            type="text"
                            placeholder={`Image URL ${index + 1}`}
                            value={url}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                ))}
                <button type="button" onClick={addImageInput} className="text-sm text-green-600 hover:text-green-800">
                    + Add Another Image
                </button>
            </div>

            <div className="pt-4">
                <Button type="submit" isLoading={isSubmitting}>
                    {initialData._id ? 'Update Product' : 'Create Product'}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;

