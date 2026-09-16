'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  Zap,
  ChevronRight,
  LogIn,
  Search,
  User,
  ShieldCheck,
  Truck,
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Sparkles,
  Boxes,
  Activity,
  ArrowRight,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useAuth } from '@/context/auth-context';
import { useSearch } from '@/context/search-context';
import { useTheme } from '@/context/theme-context';
import Avatar from 'boring-avatars';
import { DspaceLogo } from '@/components/ui/dspace-logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const NAV_LINKS = [
  { name: 'Shop All', href: '/shop', isExpress: false },
  { name: 'Bengaluru Express', href: '/delivery', isExpress: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, subtotal, openCart } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const { openSearch } = useSearch();
  const { theme, setTheme, isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto w-full pointer-events-auto">
        <div className="relative flex items-center justify-between h-14 sm:h-16 px-3.5 sm:px-6 rounded-full bg-white/85 dark:bg-neutral-900/85 backdrop-blur-2xl border border-neutral-200/90 dark:border-white/12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgb(0,0,0,0.5)] transition-all">
          {/* Left: Brand Logo & Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center group focus:outline-hidden shrink-0" aria-label="Dspace Electronics Home">
              <DspaceLogo size="md" />
            </Link>

            <div className="hidden md:block h-4 w-px bg-neutral-200 dark:bg-white/15" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-white/15 border border-neutral-200 dark:border-white/15 font-bold shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-white/10'
                    }`}
                  >
                    {link.isExpress && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/15 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400">
                        <Zap className="w-2.5 h-2.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                      </span>
                    )}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Search Trigger Pill */}
            <button
              onClick={openSearch}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100/90 dark:bg-white/10 hover:bg-neutral-200/90 dark:hover:bg-white/15 border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-500 dark:text-neutral-400 transition-all cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>Search chips...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-black/40 border border-neutral-200 dark:border-white/10 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle className="p-1.5 sm:p-2" />

            {user ? (
              user.role === 'admin' ? (
                /* ================= ADMIN ROLE CONTROLS ================= */
                <>
                  {/* Direct Admin Console Launch Pill (desktop) */}
                  <Link
                    href="/admin"
                    className="hidden sm:flex items-center gap-1.5 bg-[#e51e2b] hover:bg-[#c91823] text-white active:scale-[0.97] px-3.5 sm:px-4 py-1.5 rounded-full font-bold text-xs transition-all shadow-md shadow-[#e51e2b]/20 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Admin Console</span>
                  </Link>

                  {/* Admin Profile Photo Avatar with Interactive Admin Menu */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="relative p-0.5 rounded-full hover:ring-2 hover:ring-[#e51e2b]/50 transition-all shrink-0 group focus:outline-hidden cursor-pointer"
                      title={`${user.fullName} (${user.email})`}
                      aria-label="Admin Profile & Hub Operations"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-[#e51e2b]/60 overflow-hidden bg-neutral-900 flex items-center justify-center transition-all group-hover:scale-105 shadow-inner">
                        <Avatar
                          size={32}
                          name={user.fullName || user.email}
                          variant="beam"
                          colors={['#e51e2b', '#111827', '#f59e0b', '#10b981', '#ffffff']}
                        />
                      </div>
                      <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#e51e2b] text-[8px] text-white font-bold ring-2 ring-white dark:ring-neutral-900">
                        ⚡
                      </span>
                    </button>

                    {/* Admin Dropdown Panel */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 top-full mt-3 w-72 sm:w-80 rounded-3xl p-3 border border-neutral-200/90 dark:border-white/15 bg-white/95 dark:bg-[#0e1117]/95 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.85)] z-50 text-neutral-900 dark:text-white space-y-3">
                        {/* Admin Header */}
                        <div className="p-3 rounded-2xl bg-[#e51e2b]/5 dark:bg-[#e51e2b]/10 border border-[#e51e2b]/20 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full ring-2 ring-[#e51e2b]/40 overflow-hidden bg-neutral-900 shrink-0">
                            <Avatar
                              size={40}
                              name={user.fullName || user.email}
                              variant="beam"
                              colors={['#e51e2b', '#111827', '#f59e0b', '#10b981', '#ffffff']}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-neutral-950 dark:text-white truncate">
                                {user.fullName}
                              </p>
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e51e2b] text-white shrink-0">
                                Admin Hub
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Admin Operational Hub Actions */}
                        <div className="space-y-1">
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#e51e2b] hover:bg-[#c91823] text-white font-bold text-xs shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <LayoutDashboard className="w-4 h-4" />
                              <span>Admin Control Panel</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href="/admin"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Boxes className="w-4 h-4 text-neutral-400" />
                              <span>Inventory &amp; Stock Ledger</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          </Link>

                          <Link
                            href="/admin"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Truck className="w-4 h-4 text-neutral-400" />
                              <span>Live Porter Dispatch Radar</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          </Link>

                          <Link
                            href="/admin"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Activity className="w-4 h-4 text-neutral-400" />
                              <span>Commercial Analytics</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          </Link>

                          <Link
                            href="/account"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <ShieldCheck className="w-4 h-4 text-neutral-400" />
                              <span>Hub Operations &amp; Staff Profile</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          </Link>
                        </div>

                        {/* Log out */}
                        <div className="pt-2 border-t border-neutral-200/70 dark:border-white/10 flex items-center justify-end px-1">
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileMenuOpen(false);
                            }}
                            className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* ================= CUSTOMER / MAKER ROLE CONTROLS ================= */
                <>
                  {/* Wishlist (hidden on tiny screens to avoid crowding) */}
                  <Link
                    href="/wishlist"
                    className="hidden sm:flex relative p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart className="w-4 h-4" />
                    {totalWishlistItems > 0 && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#e51e2b] text-white text-[9px] font-bold flex items-center justify-center">
                        {totalWishlistItems}
                      </span>
                    )}
                  </Link>

                  {/* Cart Capsule */}
                  <button
                    onClick={openCart}
                    className="relative flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 active:scale-[0.97] px-2.5 sm:px-4 py-1.5 rounded-full font-semibold text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline font-mono">
                      {totalItems > 0 ? `₹${subtotal.toLocaleString('en-IN')}` : 'Cart'}
                    </span>
                    {totalItems > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e51e2b] text-white text-[10px] font-bold">
                        {totalItems}
                      </span>
                    )}
                  </button>

                  {/* Customer Avatar & Menu */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="relative p-0.5 rounded-full hover:ring-2 hover:ring-[#e51e2b]/50 transition-all shrink-0 group focus:outline-hidden cursor-pointer"
                      title={`${user.fullName} (${user.email})`}
                      aria-label="Customer Profile Menu"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-neutral-200 dark:ring-white/20 overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center transition-all group-hover:scale-105 shadow-inner">
                        <Avatar
                          size={32}
                          name={user.fullName || user.email}
                          variant="beam"
                          colors={['#e51e2b', '#111827', '#3b82f6', '#10b981', '#f59e0b']}
                        />
                      </div>
                    </button>

                    {/* Customer Dropdown Panel */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 top-full mt-3 w-72 sm:w-80 rounded-3xl p-3 border border-neutral-200/90 dark:border-white/15 bg-white/95 dark:bg-[#0e1117]/95 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.85)] z-50 text-neutral-900 dark:text-white space-y-3">
                        {/* Header info */}
                        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/70 dark:border-white/10 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full ring-2 ring-neutral-200 dark:ring-white/15 overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0">
                            <Avatar
                              size={40}
                              name={user.fullName || user.email}
                              variant="beam"
                              colors={['#e51e2b', '#111827', '#3b82f6', '#10b981', '#f59e0b']}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-neutral-950 dark:text-white truncate">
                                {user.fullName}
                              </p>
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 shrink-0">
                                Pro Maker
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Customer Navigation links */}
                        <div className="space-y-1">
                          <Link
                            href="/account"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Package className="w-4 h-4 text-neutral-400" />
                              <span>My Orders &amp; Live Tracking</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          </Link>

                          <Link
                            href="/account"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <User className="w-4 h-4 text-neutral-400" />
                              <span>Lab Account &amp; Addresses</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          </Link>

                          <Link
                            href="/wishlist"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Heart className="w-4 h-4 text-neutral-400" />
                              <span>Saved Wishlist</span>
                            </div>
                            {totalWishlistItems > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#e51e2b] text-white">
                                {totalWishlistItems}
                              </span>
                            )}
                          </Link>
                        </div>

                        {/* Log out */}
                        <div className="pt-2 border-t border-neutral-200/70 dark:border-white/10 flex items-center justify-end px-1">
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileMenuOpen(false);
                            }}
                            className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )
            ) : (
              /* ================= GUEST CONTROLS ================= */
              <>
                {/* Wishlist (desktop) */}
                <Link
                  href="/wishlist"
                  className="hidden sm:flex relative p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-4 h-4" />
                  {totalWishlistItems > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#e51e2b] text-white text-[9px] font-bold flex items-center justify-center">
                      {totalWishlistItems}
                    </span>
                  )}
                </Link>

                {/* Cart Capsule */}
                <button
                  onClick={openCart}
                  className="relative flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 active:scale-[0.97] px-2.5 sm:px-4 py-1.5 rounded-full font-semibold text-xs transition-all shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-mono">
                    {totalItems > 0 ? `₹${subtotal.toLocaleString('en-IN')}` : 'Cart'}
                  </span>
                  {totalItems > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e51e2b] text-white text-[10px] font-bold">
                      {totalItems}
                    </span>
                  )}
                </button>

                {/* Sign In Button (hidden on mobile navbar, prominent in mobile menu) */}
                <Link
                  href="/signin"
                  className="hidden sm:flex items-center gap-1.5 bg-[#e51e2b] text-white hover:bg-[#c91823] active:scale-[0.97] font-bold px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs transition-all shadow-md shadow-[#e51e2b]/25 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-neutral-900 dark:text-white" /> : <Menu className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Floating Sheet */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-3xl border border-neutral-200/90 dark:border-white/15 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl shadow-2xl space-y-3 transition-all">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openSearch();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-100 dark:bg-white/10 text-xs font-medium text-neutral-600 dark:text-neutral-300"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Search components...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-black/40 text-[10px] font-mono">⌘K</kbd>
            </button>

            {/* Appearance Theme Selector */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/70 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Appearance</span>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200/80 dark:border-white/10 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !isDark ? 'bg-neutral-100 text-neutral-950 font-bold shadow-2xs' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isDark ? 'bg-white/15 text-white font-bold shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full ring-2 ring-neutral-200 dark:ring-white/15 overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0">
                      <Avatar
                        size={40}
                        name={user.fullName || user.email}
                        variant="beam"
                        colors={['#e51e2b', '#111827', '#3b82f6', '#10b981', '#f59e0b']}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                        {user.fullName}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      user.role === 'admin'
                        ? 'bg-[#e51e2b]/15 text-[#e51e2b] border border-[#e51e2b]/30'
                        : 'bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {user.role === 'admin' ? 'Admin Hub' : 'Maker'}
                  </span>
                </div>

                {/* Mobile Admin Action Button */}
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#e51e2b] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Launch Admin Control Panel</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>My Account</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors font-semibold"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-neutral-950/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-white dark:text-neutral-950" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Sign In / Register</span>
                    <span className="text-xs text-neutral-300 dark:text-neutral-700">Access orders &amp; fast checkout</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
              </Link>
            )}

            <div className="flex flex-col gap-1.5 pt-1">
              {/* Wishlist in mobile navigation menu */}
              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 border border-neutral-200/60 dark:border-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Saved Wishlist</span>
                </div>
                {totalWishlistItems > 0 ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#e51e2b] text-white">
                    {totalWishlistItems}
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                )}
              </Link>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 border border-neutral-200/60 dark:border-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {link.isExpress && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 dark:bg-amber-400/20 border border-amber-500/20 dark:border-amber-400/30 text-amber-600 dark:text-amber-400">
                        <Zap className="w-3 h-3 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                      </span>
                    )}
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;

