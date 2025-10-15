// maheshpatil369/shrinagar/Shrinagar-fec0a47de051ffa389da59e3900a2428b5397e43/Frontend1/src/lib/products.ts
import { api } from './api';

const getAuthHeaders = () => {
    const userInfoItem = localStorage.getItem('userInfo');
    if (!userInfoItem) {
        // Handle case where user is not logged in
        console.error("User not logged in");
        // You might want to throw an error or redirect here
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
    seller: string;
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

export const updateProduct = async (id: string, productData: ProductFormData): Promise<Product> => {
    const payload = {
        ...productData,
        images: productData.images.split(',').map(img => img.trim()).filter(img => img),
    };
    const { data } = await api.put(`/products/${id}`, payload, getAuthHeaders());
    return data;
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/products/${id}`, getAuthHeaders());
    return data;
};

