// FILENAME: src/pages/ProductDetailPage.jsx
//
// Displays detailed information for a single product, including the
// crucial "AR Try-On" and "Purchase from Seller" buttons.

import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';

// Mock data simulating a single product fetched from the API
const mockSingleProduct = {
    _id: '1',
    name: 'Seraphina Diamond Ring',
    price: 1250,
    category: 'ring',
    material: '18k White Gold',
    images: [
        'https://placehold.co/600x600/f0e9e9/333?text=Ring+View+1',
        'https://placehold.co/600x600/f0e9e9/333?text=Ring+View+2',
        'https://placehold.co/600x600/f0e9e9/333?text=Ring+View+3',
    ],
    description: 'An exquisite ring featuring a 1.5-carat brilliant-cut diamond, set in a delicate 18k white gold band. A timeless piece for a timeless promise. This elegant design is perfect for engagements, anniversaries, or as a statement of personal style.',
    seller: { businessName: 'Eternity Jewels' },
    affiliateUrl: 'https://example.com/seller1/product1',
    arModelUrl: 'path/to/ring_model.glb', // Path for the AR model
};

const ProductDetailPage = ({ page, setPage }) => {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        const productId = page.id;
        // In a real app, you'd fetch the product by its ID:
        // apiClient.get(`/api/products/${productId}`).then(response => { ... });
        
        // Also, you would send a 'view' event to the backend
        // apiClient.post(`/api/products/${productId}/view`);

        setTimeout(() => { // Simulating network delay
            setProduct(mockSingleProduct);
            setMainImage(mockSingleProduct.images[0]);
            setIsLoading(false);
        }, 1000);
    }, [page.id]);

    const handleAffiliateClick = () => {
        // 1. Track the click by calling your backend
        // apiClient.post(`/api/products/${product._id}/click`);
        
        // 2. Redirect the user to the seller's website
        alert(`Redirecting to seller's website for purchase...`);
        window.open(product.affiliateUrl, '_blank');
    };
    
    const handleArTryOn = () => {
        // This is where Kashish's AR module would be triggered.
        alert(`Launching AR Try-On for model: ${product.arModelUrl}`);
    };

    if (isLoading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Spinner /></div>;
    }

    if (!product) {
        return <div className="min-h-[60vh] flex items-center justify-center"><p>Product not found.</p></div>;
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div>
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {product.images.map((img, index) => (
                            <div key={index} className={`aspect-square bg-gray-100 rounded-md cursor-pointer overflow-hidden ${mainImage === img ? 'ring-2 ring-green-500' : ''}`} onClick={() => setMainImage(img)}>
                                <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Details */}
                <div>
                    <p className="text-sm uppercase text-gray-500 mb-2">Sold by {product.seller.businessName}</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4" style={{fontFamily: "'Playfair Display', serif"}}>{product.name}</h1>
                    <p className="text-3xl text-gray-900 mb-6">${product.price.toFixed(2)}</p>
                    <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
                    
                    <div className="mb-8">
                        <h3 className="font-semibold text-gray-800 mb-2">Details:</h3>
                        <ul className="list-disc list-inside text-gray-600">
                            <li>Material: {product.material}</li>
                            <li className="capitalize">Category: {product.category}</li>
                        </ul>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        {product.arModelUrl && (
                             <Button onClick={handleArTryOn}>
                                ✨ AR Virtual Try-On
                            </Button>
                        )}
                        <Button onClick={handleAffiliateClick}>
                            Purchase from Seller
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
