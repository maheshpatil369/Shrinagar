// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/lib/notifications.ts
import { api } from './api';

export interface Notification {
  _id: string;
  user: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
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

export const getMyNotifications = async (): Promise<Notification[]> => {
    const { data } = await api.get('/notifications', getAuthHeaders());
    return data;
};

export const markNotificationAsRead = async (id: string): Promise<Notification> => {
    const { data } = await api.put(`/notifications/${id}/read`, {}, getAuthHeaders());
    return data;
};
