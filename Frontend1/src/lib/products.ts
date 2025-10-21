// maheshpatil369/shrinagar/Shrinagar-5f116f4d15321fb5db89b637c78651e13d353027/Frontend1/src/lib/products.ts
import { api } from './api';
import { User } from './auth';

const getAuthHeaders = () => {
    const userInfoItem = localStorage.getItem('userInfo');
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

export interface SellerProfile {
    _id: string;
    businessName: string;
}

export interface PopulatedSeller extends User {
    sellerProfile?: SellerProfile;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'watch' | 'other';
    brand: string;
    material: string;
    images: string[]; // Base64 Data URIs
    affiliateUrl: string;
    seller: PopulatedSeller | string;
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
  images: string; // Storing as comma-separated data URIs in form
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
    const { data } = await api.post(`/products/${id}/track-click`);
    return data;
};

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
    // Destructure to separate the images string from the rest of the data
    const { images, ...rest } = productData;

    // Create a new payload object that will have the correct types.
    // 'rest' contains all properties from productData except for 'images'.
    const payload: Partial<Omit<ProductFormData, 'images'>> & { images?: string[] } = {
        ...rest,
    };

    // If the images string exists, split it into an array and add it to the payload.
    if (images) {
        payload.images = images.split(',').map(img => img.trim()).filter(img => img);
    }

    const { data } = await api.put(`/products/${id}`, payload, getAuthHeaders());
    return data;
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/products/${id}`, getAuthHeaders());
    return data;
};

