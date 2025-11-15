import { axios } from './api'; // FIX: Changed from default 'import axios' to named 'import { axios }'
import { Product } from './products';
import { Seller } from './seller';
import { User } from './auth';

// --- TYPE DEFINITIONS ---

// Define the expected structure for the detailed seller response
interface DetailedSellerResponse {
    // We assume the seller model contains the populated 'user' object
    seller: Seller & { user: User }; 
    products: Product[];
    history: any[]; 
}

// Define the structure for dashboard stats
interface AdminStats {
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    pendingApprovals: number;
}

// Define the structure for pending approvals list
interface PendingApprovals {
    sellers: Seller[];
    products: Product[];
}

// --- API FUNCTIONS ---

// @desc Fetch detailed information for a single seller (used in Admin Modal)
// @route GET /api/admin/sellers/details/:id
export const getSellerDetailsForAdmin = async (sellerId: string): Promise<DetailedSellerResponse> => {
    // The path here matches the FIXED backend route '/sellers/details/:id'
    const { data } = await axios.get(`/api/admin/sellers/details/${sellerId}`); 
    return data;
};

// @desc Fetch summary statistics for the admin dashboard
// @route GET /api/admin/stats
export const getAdminDashboardStats = async (): Promise<AdminStats> => {
    const { data } = await axios.get('/api/admin/stats');
    return data;
};

// @desc Fetch lists of sellers and products requiring approval
// @route GET /api/admin/approvals
export const getPendingApprovals = async (): Promise<PendingApprovals> => {
    const { data } = await axios.get('/api/admin/approvals');
    return data;
};

// @desc Update a seller's approval status
// @route PUT /api/admin/sellers/:id/status
export const updateSellerStatus = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended'): Promise<void> => {
    await axios.put(`/api/admin/sellers/${sellerId}/status`, { status });
};

// @desc Update a product's status
// @route PUT /api/admin/products/:id/status
export const updateProductStatus = async (productId: string, status: 'approved' | 'rejected'): Promise<void> => {
    await axios.put(`/api/admin/products/${productId}/status`, { status });
};

// @desc Fetch chart data (users and products over time)
// @route GET /api/admin/chart-data
export const getAdminChartData = async (period: 'week' | 'month' | 'all_time'): Promise<any[]> => {
    const { data } = await axios.get(`/api/admin/chart-data?period=${period}`);
    return data;
};

// @desc Fetch all users for the management table
// @route GET /api/admin/users
export const adminGetAllUsers = async (): Promise<User[]> => {
    const { data } = await axios.get('/api/admin/users');
    return data;
};

// @desc Fetch all sellers for the management table
// @route GET /api/admin/sellers/all
export const adminGetAllSellers = async (): Promise<Seller[]> => {
    const { data } = await axios.get('/api/admin/sellers/all');
    return data;
};

// @desc Fetch all products for the management table
// @route GET /api/admin/products/all
export const adminGetAllProducts = async (): Promise<Product[]> => {
    const { data } = await axios.get('/api/admin/products/all');
    return data;
};