// maheshpatil369/shrinagar/Shrinagar-abcbe203037457af5cdd1912b6e3260dabf070c5/Frontend1/src/lib/seller.ts
import { api } from './api';
import { User } from './auth';
import { Product } from './products';

// ... existing code ...
export interface Seller {
  _id: string;
  user: User;
  businessName: string;
  gstNumber: string;
  panNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  rating: number;
  verificationDocuments?: {
      gstCertificate?: string;
      panCard?: string;
  };
}

// NEW: Define structure for Seller Analytics
export interface SellerAnalytics {
    totalViews: number;
    totalClicks: number;
    conversionRate: number;
    topProducts: Product[];
    performanceData: { name: string; views: number; clicks: number }[];
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


export const getSellerDashboard = async (): Promise<Seller> => {
    // ... existing code ...
    const { data } = await api.get('/sellers/dashboard', getAuthHeaders());
    return data;
};

// ADDED: Function to get products for the logged-in seller
export const getSellerProducts = async (): Promise<Product[]> => {
    // ... existing code ...
    const { data } = await api.get('/sellers/products', getAuthHeaders());
    return data;
};

export const enrollSeller = async (sellerData: Omit<Seller, '_id' | 'user' | 'status' | 'rating'>): Promise<Seller> => {
    // ... existing code ...
    const { data } = await api.post('/sellers/enroll', sellerData, getAuthHeaders());
    return data;
};

// New function to upload verification documents
export const uploadVerificationDocument = async (formData: FormData): Promise<{ message: string; image: string; }> => {
    // ... existing code ...
    const { data } = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders().headers,
        },
    });
    return data;
};

// NEW: Function to get analytics for the logged-in seller
export const getSellerAnalytics = async (): Promise<SellerAnalytics> => {
    const { data } = await api.get('/sellers/analytics', getAuthHeaders());
    return data;
};
