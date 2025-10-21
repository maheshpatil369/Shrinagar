// maheshpatil369/shrinagar/Shrinagar-5f116f4d15321fb5db89b637c78651e13d353027/Frontend1/src/lib/user.ts
import { api } from './api';
import { Product } from './products';
import { getCurrentUser } from './auth';

// --- Local Wishlist Helpers ---
const LOCAL_WISHLIST_KEY = 'shrinagar_wishlist';

const getLocalWishlist = (): string[] => {
    try {
        const item = localStorage.getItem(LOCAL_WISHLIST_KEY);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error("Failed to parse local wishlist:", error);
        return [];
    }
};

const setLocalWishlist = (ids: string[]) => {
    localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(ids));
};

const addToLocalWishlist = (productId: string) => {
    const ids = getLocalWishlist();
    if (!ids.includes(productId)) {
        setLocalWishlist([productId, ...ids]);
    }
};

const removeFromLocalWishlist = (productId: string) => {
    let ids = getLocalWishlist();
    ids = ids.filter(id => id !== productId);
    setLocalWishlist(ids);
};
// --- End Local Wishlist Helpers ---

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
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Logged-in user: fetch from API
        const { data } = await api.get('/users/wishlist', getAuthHeaders());
        return data;
    } else {
        // Guest user: fetch from local storage
        const ids = getLocalWishlist();
        if (ids.length === 0) return [];
        // Use the endpoint that fetches products by a list of IDs
        const { data } = await api.get('/products', { params: { ids: ids.join(',') } });
        return data;
    }
};

export const addToWishlist = async (productId: string): Promise<any> => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const { data } = await api.post('/users/wishlist', { productId }, getAuthHeaders());
        return data;
    } else {
        addToLocalWishlist(productId);
        return Promise.resolve({ message: 'Added to local wishlist' });
    }
};

export const removeFromWishlist = async (productId: string): Promise<any> => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const { data } = await api.delete(`/users/wishlist/${productId}`, getAuthHeaders());
        return data;
    } else {
        removeFromLocalWishlist(productId);
        return Promise.resolve({ message: 'Removed from local wishlist' });
    }
};

// A helper to easily check if a product is in the wishlist state array
export const isProductInWishlist = (productId: string, wishlist: Product[]): boolean => {
    return wishlist.some(p => p._id === productId);
};

