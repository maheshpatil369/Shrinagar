// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Frontend1/src/lib/admin.ts
import { api } from './api';
import { Product } from './products';
import { User } from './auth';
import { Seller } from './seller';

// Define structure for Seller History
export interface SellerHistory {
    _id: string;
    sellerId: string;
    changedBy: User;
    changes: {
        field: string;
        oldValue: string;
        newValue: string;
    }[];
    notes: string;
    createdAt: string;
}


const getAuthHeaders = () => {
    const userInfoItem = localStorage.getItem('userInfo');
    if (!userInfoItem) throw new Error("User not logged in");
    const userInfo = JSON.parse(userInfoItem);
    return { headers: { Authorization: `Bearer ${userInfo.token}` } };
};

export const getAdminDashboardStats = async (): Promise<any> => {
    const { data } = await api.get('/admin/stats', getAuthHeaders());
    return data;
}

export const getAdminChartData = async (period: 'week' | 'month' | 'year'): Promise<any[]> => {
    const { data } = await api.get('/admin/chart-data', { ...getAuthHeaders(), params: { period } });
    return data;
};

export const getPendingApprovals = async (): Promise<{ sellers: Seller[], products: Product[] }> => {
    const { data } = await api.get('/admin/approvals', getAuthHeaders());
    return data;
};

export const getSellerDetailsForAdmin = async (sellerId: string): Promise<{ seller: Seller, products: Product[], history: SellerHistory[] }> => {
    const { data } = await api.get(`/admin/sellers/${sellerId}`, getAuthHeaders());
    return data;
};

export const updateSellerStatus = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended'): Promise<Seller> => {
    const { data } = await api.put(`/admin/sellers/${sellerId}/status`, { status }, getAuthHeaders());
    return data;
};

export const updateProductStatus = async (productId: string, status: 'approved' | 'rejected'): Promise<Product> => {
    const { data } = await api.post(`/admin/products/${productId}/status`, { status }, getAuthHeaders());
    return data;
};


export const getSellerHistory = async (sellerId: string): Promise<SellerHistory[]> => {
    const { data } = await api.get(`/admin/sellers/${sellerId}/history`, getAuthHeaders());
    return data;
};

// Functions to get all users, sellers, and products for the management view
export const adminGetAllUsers = async (): Promise<User[]> => {
    const { data } = await api.get('/admin/users', getAuthHeaders());
    return data;
};

export const adminGetAllSellers = async (): Promise<Seller[]> => {
    const { data } = await api.get('/admin/sellers', getAuthHeaders());
    return data;
};

export const adminGetAllProducts = async (): Promise<Product[]> => {
    const { data } = await api.get('/admin/products', getAuthHeaders());
    return data;
};

