// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/lib/user.ts
import { api } from './api';
import { Product } from './products';

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

export const getWishlist = async (): Promise<Product[]> => {
    const { data } = await api.get('/users/wishlist', getAuthHeaders());
    return data;
};

export const addToWishlist = async (productId: string): Promise<{ message: string }> => {
    const { data } = await api.post('/users/wishlist', { productId }, getAuthHeaders());
    return data;
};

export const removeFromWishlist = async (productId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/users/wishlist/${productId}`, getAuthHeaders());
    return data;
};

