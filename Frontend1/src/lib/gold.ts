// Frontend1/src/lib/gold.ts
import { api } from './api';

export interface MetalPriceData {
    symbol: string;
    price: number;
    currency: string;
    timestamp: number;
    changePercent?: number;
}

export const fetchMetalPrice = async (symbol: 'XAU' | 'XAG' | 'XPT'): Promise<MetalPriceData> => {
    try {
        // Fetch from our backend which proxies the GoldAPI
        const { data } = await api.get(`/gold/${symbol}`);
        return data;
    } catch (error) {
        console.error(`Failed to fetch ${symbol} price:`, error);
        throw new Error(`Could not load ${symbol} price.`);
    }
};