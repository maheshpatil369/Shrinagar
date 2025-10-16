// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/lib/products.ts
import { api } from './api';

const getAuthHeaders = () => {
    const userInfoItem = localStorage.getItem('userInfo');
    // For public routes, we don't need a token, so we can return an empty header object.
    if (!userInfoItem) {
        return {};
    }
    const userInfo = JSON.parse(userInfoItem);
    return {
        headers: {
            Authorization: `Bearer ${userInfo.token}`,
        },
    };
};

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'watch' | 'other';
    brand: string;
    material: string;
    images: string[];
    affiliateUrl: string;
    seller: string | { _id: string; name: string };
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    viewCount: number;
    clickCount: number;
}

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  category: 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'watch' | 'other';
  brand: string;
  material: string;
  images: string; // Storing as comma-separated string in form
  affiliateUrl: string;
};

export interface ProductFilters {
    keyword?: string;
    category?: string;
    brand?: string;
    material?: string;
    minPrice?: number;
    maxPrice?: number;
}

// Fetches only products with 'approved' status, with filtering
export const getApprovedProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
    const { data } = await api.get('/products', { params: filters });
    return data;
};

// Fetches a single product by ID
export const getProductById = async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
};

// Fetches trending products
export const getTrendingProducts = async (): Promise<Product[]> => {
    const { data } = await api.get('/products/trending');
    return data;
};

// Tracks affiliate link click
export const trackAffiliateClick = async (id: string): Promise<{ message: string }> => {
    const { data } = await api.post(`/products/${id}/track-click`);
    return data;
};


// New function to handle image uploads
export const uploadProductImage = async (formData: FormData): Promise<{ message: string; image: string; }> => {
    const { data } = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders().headers,
        },
    });
    return data;
};

export const getMyProducts = async (): Promise<Product[]> => {
    const { data } = await api.get('/products/myproducts', getAuthHeaders());
    return data;
};

export const createProduct = async (productData: ProductFormData): Promise<Product> => {
    const payload = {
        ...productData,
        images: productData.images.split(',').map(img => img.trim()).filter(img => img),
    };
    const { data } = await api.post('/products', payload, getAuthHeaders());
    return data;
};

export const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<Product> => {
    const payload = { ...productData };
    if (productData.images) {
        // @ts-ignore
        payload.images = productData.images.split(',').map(img => img.trim()).filter(img => img);
    }
    const { data } = await api.put(`/products/${id}`, payload, getAuthHeaders());
    return data;
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/products/${id}`, getAuthHeaders());
    return data;
};

