'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { getProductsAction, addProductAction, deleteProductAction, updateProductStockAction } from '@/app/actions';
import { useAuth } from './auth-context';

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  voltageFilter: string;
  setVoltageFilter: (voltage: string) => void;
  addProduct: (newProduct: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewsCount'>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateStock: (id: string, newStock: number) => void;
  refreshProducts: () => Promise<void>;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [voltageFilter, setVoltageFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshProducts = async () => {
    setIsLoading(true);
    try {
      const res = await getProductsAction();
      if (res.success && res.data && res.data.length > 0) {
        setProducts(res.data);
        localStorage.setItem('dspace_products_v2', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Could not fetch from server actions, using client state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.removeItem('dspace_products'); // Clean old legacy cache
    localStorage.removeItem('dspace_products_v2'); // Clean old 36 items cache

    const saved = localStorage.getItem('dspace_products_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter to only the 5 valid base components or newly created admin components
          const valid5Ids = new Set(INITIAL_PRODUCTS.map((p) => p.id));
          const cleaned = parsed.filter((p: Product) => valid5Ids.has(p.id) || p.id.startsWith('dsp-'));
          if (cleaned.length > 0) {
            setProducts(cleaned);
          } else {
            setProducts(INITIAL_PRODUCTS);
          }
        }
      } catch {
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('dspace_products_v3', JSON.stringify(INITIAL_PRODUCTS));
    }
    refreshProducts();
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem('dspace_products_v3', JSON.stringify(updated));
  };

  const addProduct = async (
    data: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewsCount'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (role !== 'admin') {
      return {
        success: false,
        error: 'Permission Denied: Only Dspace Admins are authorized to list new electronic components.',
      };
    }

    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const stockNum = Number(data.stock ?? data.stockCount ?? 0);
    const newProduct: Product = {
      ...data,
      id: `dsp-${Date.now()}`,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      stock: stockNum,
      stockCount: stockNum,
      inStock: stockNum > 0,
      isSameDayEligible: data.isSameDayEligible ?? true,
      rating: 5.0,
      reviewsCount: 1,
      images: data.images && data.images.length > 0 ? data.images : (data.imageUrl ? [data.imageUrl] : ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80']),
    };

    const serverRes = await addProductAction(newProduct, role);
    if (!serverRes.success && serverRes.error?.includes('Unauthorized')) {
      return serverRes;
    }

    const updated = [newProduct, ...products];
    saveProducts(updated);
    return { success: true };
  };

  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (role !== 'admin') {
      return {
        success: false,
        error: 'Permission Denied: Only Dspace Admins can remove items from inventory.',
      };
    }

    await deleteProductAction(id, role);
    const updated = products.filter((p) => p.id !== id && p.slug !== id);
    saveProducts(updated);
    return { success: true };
  };

  const updateStock = (id: string, newStock: number) => {
    if (role !== 'admin') {
      alert('Only Dspace Admins can update inventory stock levels.');
      return;
    }
    updateProductStockAction(id, newStock, role);
    const updated = products.map((p) =>
      p.id === id || p.slug === id
        ? {
            ...p,
            stock: newStock,
            stockCount: newStock,
            inStock: newStock > 0,
            blrHubStock: Math.min(newStock, p.blrHubStock),
          }
        : p
    );
    saveProducts(updated);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.specs &&
        Object.entries(p.specs).some(
          ([k, v]) =>
            k.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    const matchesVoltage =
      voltageFilter === 'all' ||
      (p.voltageLogic && p.voltageLogic.includes(voltageFilter)) ||
      (p.specs && p.specs['Operating Voltage'] && p.specs['Operating Voltage'].includes(voltageFilter)) ||
      (p.specs && p.specs['Supply Voltage'] && p.specs['Supply Voltage'].includes(voltageFilter));

    return matchesCategory && matchesSearch && matchesVoltage;
  });

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        voltageFilter,
        setVoltageFilter,
        addProduct,
        deleteProduct,
        updateStock,
        refreshProducts,
        isLoading,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
