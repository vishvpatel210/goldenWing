import React, { createContext, useContext, useState, useEffect } from 'react';
import { Flight } from '../types';
import { storage } from '../utils/storage';

export interface WishlistItem {
  id: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  price: number;
  cabinClass: string;
  airline: string;
  duration: string;
  savedAt: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'savedAt'>) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: Omit<WishlistItem, 'savedAt'>) => void;
}

const DEFAULT_WISHLIST: WishlistItem[] = [
  {
    id: 'wish-1',
    fromCode: 'DXB',
    fromCity: 'Dubai',
    toCode: 'LHR',
    toCity: 'London',
    price: 2400,
    cabinClass: 'First Class',
    airline: 'GoldenWing Airways',
    duration: '7h 30m',
    savedAt: '2026-11-01',
  },
  {
    id: 'wish-2',
    fromCode: 'HND',
    fromCity: 'Tokyo',
    toCode: 'CDG',
    toCity: 'Paris',
    price: 3900,
    cabinClass: 'First Class',
    airline: 'GoldenWing Airways',
    duration: '13h 40m',
    savedAt: '2026-11-04',
  },
];

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(DEFAULT_WISHLIST);

  useEffect(() => {
    loadSavedWishlist();
  }, []);

  const loadSavedWishlist = async () => {
    try {
      const data = await storage.getItem('goldenwing_wishlist');
      if (data) {
        setWishlist(JSON.parse(data));
      }
    } catch (e) {
      console.warn('Failed to load wishlist:', e);
    }
  };

  const persistWishlist = async (items: WishlistItem[]) => {
    setWishlist(items);
    await storage.setItem('goldenwing_wishlist', JSON.stringify(items));
  };

  const addToWishlist = (item: Omit<WishlistItem, 'savedAt'>) => {
    if (!wishlist.some((w) => w.id === item.id)) {
      const updated = [
        ...wishlist,
        { ...item, savedAt: new Date().toISOString().split('T')[0] },
      ];
      persistWishlist(updated);
    }
  };

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter((w) => w.id !== id);
    persistWishlist(updated);
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((w) => w.id === id);
  };

  const toggleWishlist = (item: Omit<WishlistItem, 'savedAt'>) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

