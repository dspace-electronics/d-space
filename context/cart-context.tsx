'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant, CartItem, BLRZone } from '@/lib/types';
import { BLR_ZONES } from '@/lib/mock-data';
import { useAuth } from '@/context/auth-context';

interface PromoDiscount {
  code: string;
  percent: number; // e.g. 10 for 10%
  description: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, delta: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode: string | null;
  promoDiscount: PromoDiscount | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  selectedZone: BLRZone;
  setSelectedZone: (zone: BLRZone) => void;
  courierOption: 'porter_2wheeler' | 'porter_express';
  setCourierOption: (option: 'porter_2wheeler' | 'porter_express') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  freeDeliveryThreshold: number;
  amountForFreeDelivery: number;
}

const VALID_PROMOS: Record<string, PromoDiscount> = {
  MAKER10: { code: 'MAKER10', percent: 10, description: '10% off for hardware makers' },
  BLRFAST: { code: 'BLRFAST', percent: 15, description: '15% Bengaluru launch discount' },
  DSPACE5: { code: 'DSPACE5', percent: 5, description: '5% welcome discount' },
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedZone, setSelectedZone] = useState<BLRZone>(BLR_ZONES[0]); // HSR Layout default
  const [courierOption, setCourierOption] = useState<'porter_2wheeler' | 'porter_express'>('porter_2wheeler');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<PromoDiscount | null>(null);

  const freeDeliveryThreshold = 999;

  // Load from localStorage on client mount
  useEffect(() => {
    const savedCart = localStorage.getItem('dspace_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        // ignore
      }
    }

    const savedPromo = localStorage.getItem('dspace_promo');
    if (savedPromo && VALID_PROMOS[savedPromo.toUpperCase()]) {
      setPromoCode(savedPromo.toUpperCase());
      setPromoDiscount(VALID_PROMOS[savedPromo.toUpperCase()]);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('dspace_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (promoCode) {
      localStorage.setItem('dspace_promo', promoCode);
    } else {
      localStorage.removeItem('dspace_promo');
    }
  }, [promoCode]);

  const addToCart = (product: Product, quantity: number = 1, variant?: ProductVariant) => {
    if (!user) {
      const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/shop';
      router.push(`/signin?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant?.id === variant?.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [...prev, { product, quantity, selectedVariant: variant }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && (!variantId || item.selectedVariant?.id === variantId))
      )
    );
  };

  const updateQuantity = (productId: string, delta: number, variantId?: string) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && (!variantId || item.selectedVariant?.id === variantId)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const applyPromoCode = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (VALID_PROMOS[clean]) {
      setPromoCode(clean);
      setPromoDiscount(VALID_PROMOS[clean]);
      return { success: true, message: `Promo code ${clean} applied (${VALID_PROMOS[clean].percent}% OFF)` };
    }
    return { success: false, message: 'Invalid promo code. Try MAKER10 or BLRFAST.' };
  };

  const removePromoCode = () => {
    setPromoCode(null);
    setPromoDiscount(null);
  };

  const openCart = () => {
    if (!user) {
      const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/shop';
      router.push(`/signin?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }
    setIsCartOpen(true);
  };
  const closeCart = () => setIsCartOpen(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.product.price + (item.selectedVariant?.priceModifier || 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const discount = promoDiscount ? Math.round((subtotal * promoDiscount.percent) / 100) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);

  const isFreeDelivery = subtotal >= freeDeliveryThreshold && items.length > 0;
  const baseCourierFee =
    courierOption === 'porter_express'
      ? selectedZone.expressDispatchFee
      : selectedZone.porterBikeFee;

  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : baseCourierFee;
  const total = discountedSubtotal + deliveryFee;
  const amountForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        deliveryFee,
        total,
        promoCode,
        promoDiscount,
        applyPromoCode,
        removePromoCode,
        selectedZone,
        setSelectedZone,
        courierOption,
        setCourierOption,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        freeDeliveryThreshold,
        amountForFreeDelivery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
