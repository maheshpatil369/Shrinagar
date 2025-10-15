// /Frontend1/src/lib/admin.ts
import { api } from './api';
import { Product } from './products';
import { User } from './auth';

// The Seller interface needs to be defined for the frontend
export interface Seller {
  _id: string;
  user: User; // Assuming user details are populated
  businessName: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
}

const getAuthHeaders = () => {
    const userInfoItem = localStorage.getItem('userInfo');
    if (!userInfoItem) {
        throw new Error("User not logged in");
    }
    const userInfo = JSON.parse(userInfoItem);
    return {
        headers: {
            Authorization: `Bearer ${userInfo.token}`,
        },
    };
};

// --- Seller Management ---
export const getAllSellers = async (): Promise<Seller[]> => {
    const { data } = await api.get('/sellers', getAuthHeaders());
    return data;
};

export const updateSellerStatus = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended'): Promise<Seller> => {
    const { data } = await api.put(`/sellers/${sellerId}/status`, { status }, getAuthHeaders());
    return data;
};


// --- Product Management ---
export const getAllProducts = async (): Promise<Product[]> => {
    const { data } = await api.get('/products/all', getAuthHeaders());
    return data;
}

export const updateProductStatus = async (productId: string, status: 'approved' | 'rejected' | 'suspended'): Promise<Product> => {
    // We can reuse the general updateProduct endpoint from the product controller
    // by only passing the status field.
    const { data } = await api.put(`/products/${productId}`, { status }, getAuthHeaders());
    return data;
};
