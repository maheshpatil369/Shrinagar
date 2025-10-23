// Frontend1/src/lib/gold.ts
import { api } from './api';

export interface GoldPriceData {
    price: number;
    currency: string;
    timestamp: number;
    changePercent?: number; // Optional change percentage
}

export const fetchGoldPrice = async (): Promise<GoldPriceData> => {
    try {
        const { data } = await api.get('/gold/price');
        return data;
    } catch (error) {
        console.error("Failed to fetch gold price:", error);
        // You might want to return a default or throw a specific error
        throw new Error("Could not load gold price.");
    }
};
