// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/lib/admin.ts
import { api } from './api';
import { Product } from './products';
import { User } from './auth';
import { Seller } from './seller';

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

export const getSellerById = async (sellerId: string): Promise<Seller> => {
    const { data } = await api.get(`/sellers/${sellerId}`, getAuthHeaders());
    return data;
}

export const updateSellerStatus = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended'): Promise<Seller> => {
    const { data } = await api.put(`/sellers/${sellerId}/status`, { status }, getAuthHeaders());
    return data;
};


// --- Product Management ---
export const getAllProductsForAdmin = async (): Promise<Product[]> => {
    const { data } = await api.get('/products/all', getAuthHeaders());
    return data;
}

export const updateProductStatusByAdmin = async (productId: string, status: 'approved' | 'rejected' | 'suspended'): Promise<Product> => {
    const { data } = await api.put(`/products/${productId}`, { status }, getAuthHeaders());
    return data;
};

export const deleteProductByAdmin = async (productId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/products/${productId}`, getAuthHeaders());
    return data;
}

// --- User Management ---
export const getAllUsers = async (): Promise<User[]> => {
    const { data } = await api.get('/users', getAuthHeaders());
    return data;
};

export const updateUserRole = async (userId: string, role: 'customer' | 'seller'): Promise<User> => {
    const { data } = await api.put(`/users/${userId}`, { role }, getAuthHeaders());
    return data;
};

export const deleteUser = async (userId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/users/${userId}`, getAuthHeaders());
    return data;
};


// --- Analytics ---
export interface AdminStats {
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    pendingApprovals: number;
    recentProducts: Product[];
    recentSellers: Seller[];
}

export const getAdminDashboardStats = async (): Promise<AdminStats> => {
    const { data } = await api.get('/admin/stats', getAuthHeaders());
    return data;
}
