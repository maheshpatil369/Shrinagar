// Frontend1/src/lib/products.ts
// This is the correct version of your file, restored to fix the MOCK_PRODUCTS error.
import { api } from './api';
import { User } from './auth';

const getAuthHeaders = () => {
    const userInfoItem = localStorage.getItem('userInfo');
    if (!userInfoItem) {
        return {};
    }
    try {
        const userInfo = JSON.parse(userInfoItem);
        return {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };
    } catch (e) {
        console.error("Error parsing user info from localStorage", e);
        return {}; // Return empty headers on parsing error
    }
};


export interface SellerProfile {
    _id: string;
    businessName: string;
}

export type PopulatedSeller = Omit<User, 'sellerProfile'> & {
    sellerProfile?: SellerProfile | string;
};

export interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    // PRICE REMOVED
    category: 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'watch' | 'other';
    brand: string;
    material: string;
    images: string[]; 
    affiliateUrl: string;
    seller: PopulatedSeller | string; 
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    viewCount: number;
    clickCount: number;
    createdAt?: string; 
    updatedAt?: string;
    rating: number;
    numReviews: number;
    reviews: Review[];
}

// Updated ProductFormData type
export type ProductFormData = {
  name: string;
  description: string;
  // PRICE REMOVED
  category: 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'watch' | 'other';
  brand: string;
  material: string;
  images: string[]; // Correct type: Array of strings (URLs)
  affiliateUrl: string;
};

export interface ProductFilters {
    keyword?: string;
    category?: string;
    brand?: string;
    material?: string;
    // PRICE FILTERS REMOVED
}

export const getApprovedProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
    const { data } = await api.get('/products', { params: filters });
    return data;
};

// New function to get multiple products by their IDs
export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
    if (ids.length === 0) return [];
    const { data } = await api.get('/products', { params: { ids: ids.join(',') } });
    return data;
};

export const getProductById = async (id: string): Promise<{ product: Product, recommendations: Product[] }> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
};

export const getTrendingProducts = async (): Promise<Product[]> => {
    const { data } = await api.get('/products/trending');
    return data;
};

export const trackAffiliateClick = async (id: string): Promise<{ message: string }> => {
    // Tracking might not require auth, adjust if needed
    const { data } = await api.post(`/products/${id}/track-click`);
    return data;
};

// Upload function returns Cloudinary URL
export const uploadProductImage = async (formData: FormData): Promise<{ message: string; image: string; }> => {
    const { data } = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders()?.headers, // Safely access headers
        },
    });
    return data;
};

export const getMyProducts = async (): Promise<Product[]> => {
    const { data } = await api.get('/products/myproducts', getAuthHeaders());
    return data;
};

export const createProduct = async (productData: ProductFormData): Promise<Product> => {
    const { data } = await api.post('/products', productData, getAuthHeaders());
    return data;
};

export const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, productData, getAuthHeaders());
    return data;
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/products/${id}`, getAuthHeaders());
    return data;
};

export const createProductReview = async (
  productId: string,
  review: { rating: number; comment: string }
): Promise<{ message: string }> => {
  const { data } = await api.post(`/products/${productId}/reviews`, review, getAuthHeaders());
  return data;
};

// --- NEW: API call to delete a review ---
export const deleteProductReview = async (
  productId: string,
  reviewId: string
): Promise<{ message: string }> => {
  const { data } = await api.delete(
    `/products/${productId}/reviews/${reviewId}`,
    getAuthHeaders()
  );
  return data;
};
// --- End of new API call ---