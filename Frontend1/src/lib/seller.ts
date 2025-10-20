// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/lib/seller.ts
import { api } from './api';
import { User } from './auth';
import { Product } from './products';

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
    const { data } = await api.get('/sellers/dashboard', getAuthHeaders());
    return data;
};

// ADDED: Function to get products for the logged-in seller
export const getSellerProducts = async (): Promise<Product[]> => {
    const { data } = await api.get('/sellers/products', getAuthHeaders());
    return data;
};

export const enrollSeller = async (sellerData: Omit<Seller, '_id' | 'user' | 'status' | 'rating'>): Promise<Seller> => {
    const { data } = await api.post('/sellers/enroll', sellerData, getAuthHeaders());
    return data;
};

// New function to upload verification documents
export const uploadVerificationDocument = async (formData: FormData): Promise<{ message: string; image: string; }> => {
    const { data } = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders().headers,
        },
    });
    return data;
};
