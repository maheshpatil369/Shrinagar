export interface JewelryItem {
  id: string;
  name: string;
  description: string;
  // PRICE REMOVED
  category: 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'watch';
  brand: string;
  image: string;
  affiliateUrl: string;
  sellerId: string;
  approved: boolean;
  views: number;
  clicks: number;
}

export const MOCK_JEWELRY: JewelryItem[] = [
  {
    id: '1',
    name: 'Diamond Solitaire Ring',
    description: 'Elegant 18K white gold ring with 1.5ct diamond',
    // price: 12500,
    category: 'ring',
    brand: 'Luxe Jewels',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500',
    affiliateUrl: 'https://example.com/ring1',
    sellerId: 'seller1',
    approved: true,
    views: 245,
    clicks: 32,
  },
  {
    id: '2',
    name: 'Pearl Necklace',
    description: 'Classic pearl strand with 18K gold clasp',
    // price: 3800,
    category: 'necklace',
    brand: 'Pearl House',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
    affiliateUrl: 'https://example.com/necklace1',
    sellerId: 'seller1',
    approved: true,
    views: 189,
    clicks: 21,
  },
  {
    id: '3',
    name: 'Rose Gold Bracelet',
    description: 'Delicate rose gold chain bracelet with diamonds',
    // price: 2200,
    category: 'bracelet',
    brand: 'Elegance',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500',
    affiliateUrl: 'https://example.com/bracelet1',
    sellerId: 'seller2',
    approved: true,
    views: 156,
    clicks: 18,
  },
  {
    id: '4',
    name: 'Sapphire Earrings',
    description: 'Stunning blue sapphire drop earrings',
    // price: 4500,
    category: 'earrings',
    brand: 'Gem Elite',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500',
    affiliateUrl: 'https://example.com/earrings1',
    sellerId: 'seller2',
    approved: true,
    views: 203,
    clicks: 27,
  },
  {
    id: '5',
    name: 'Luxury Watch',
    description: 'Swiss automatic watch with diamond bezel',
    // price: 18900,
    category: 'watch',
    brand: 'Timepiece Co',
    image: 'https://images.unsplash.com/photo-1587836374228-4c70e4bc88f4?w=500',
    affiliateUrl: 'https://example.com/watch1',
    sellerId: 'seller1',
    approved: false,
    views: 87,
    clicks: 5,
  },
];

const STORAGE_KEY = 'jewelry_items';

export const getJewelryItems = (): JewelryItem[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_JEWELRY));
  return MOCK_JEWELRY;
};

export const addJewelryItem = (item: Omit<JewelryItem, 'id' | 'views' | 'clicks'>) => {
  const items = getJewelryItems();
  const newItem: JewelryItem = {
    ...item,
    id: Date.now().toString(),
    views: 0,
    clicks: 0,
  };
  items.push(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return newItem;
};

export const updateJewelryItem = (id: string, updates: Partial<JewelryItem>) => {
  const items = getJewelryItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const deleteJewelryItem = (id: string) => {
  const items = getJewelryItems();
  const filtered = items.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};