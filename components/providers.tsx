'use client';

import React from 'react';
import { ThemeProvider } from '@/context/theme-context';
import { AuthProvider } from '@/context/auth-context';
import { ProductProvider } from '@/context/product-context';
import { CartProvider } from '@/context/cart-context';
import { OrderProvider } from '@/context/order-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { SearchProvider } from '@/context/search-context';
import { ToastProvider } from '@/context/toast-context';
import { CommandPalette } from '@/components/search/command-palette';
import { CartDrawer } from '@/components/cart/cart-drawer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductProvider>
          <WishlistProvider>
            <CartProvider>
              <OrderProvider>
                <SearchProvider>
                  <ToastProvider>
                    {children}
                    <CommandPalette />
                    <CartDrawer />
                  </ToastProvider>
                </SearchProvider>
              </OrderProvider>
            </CartProvider>
          </WishlistProvider>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
