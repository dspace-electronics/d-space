'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Truck,
  TrendingUp,
  Database,
  ArrowLeft,
  Search,
  Plus,
  Bell,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Bike,
  AlertTriangle,
  Layers,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Terminal,
  LogOut,
  Zap,
  Gauge,
  Cpu,
  Trash2,
  Moon,
  Sun,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ArrowRight,
  ShoppingCart,
  ShoppingBag,
  PhoneCall,
  Receipt,
  Check,
  Filter,
  Navigation,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/context/product-context';
import { useOrders } from '@/context/order-context';
import { useTheme } from '@/context/theme-context';
import { DspaceLogo } from '@/components/ui/dspace-logo';
import { AddProductModal } from '@/components/admin/add-product-modal';
import Avatar from 'boring-avatars';
import { OrderStatus } from '@/lib/types';

type AdminTab = 'overview' | 'orders' | 'dispatch' | 'inventory' | 'analytics';

export default function AdminPage() {
  const { user, isAdmin, logout } = useAuth();
  const { products, deleteProduct, updateStock, refreshProducts, isLoading } = useProducts();
  const { orders, updateOrderStatus, refreshOrders } = useOrders();
  const { isDark, toggleTheme } = useTheme();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [dispatchSimulatorRunning, setDispatchSimulatorRunning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Filtered Products for Inventory Tab
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Filtered Orders for Orders Tab
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      const q = orderSearchQuery.toLowerCase().trim();
      if (!q) return matchStatus;
      const matchSearch =
        o.orderNumber?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.phone?.includes(q) ||
        o.customerEmail?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q) ||
        o.blrZone?.name?.toLowerCase().includes(q) ||
        o.items?.some((item) => item.product?.title?.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  const placedCount = orders.filter((o) => o.status === 'placed').length;
  const packedCount = orders.filter((o) => o.status === 'packed').length;
  const inTransitCount = orders.filter((o) => o.status === 'in_transit' || o.status === 'driver_assigned').length;
  const pendingCount = placedCount + packedCount;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock ?? p.stockCount ?? 0), 0);
  const lowStockProducts = products.filter((p) => (p.stock ?? p.stockCount ?? 0) <= 5);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshOrders(), refreshProducts()]);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const simulateFastDispatch = () => {
    setDispatchSimulatorRunning(true);
    const pendingOrder = orders.find((o) => o.status === 'placed' || o.status === 'packed');
    if (pendingOrder) {
      updateOrderStatus(pendingOrder.id, 'in_transit');
      setTimeout(() => {
        setDispatchSimulatorRunning(false);
        alert(`⚡ Porter Rider Assigned: Order #${pendingOrder.orderNumber || pendingOrder.id.slice(0, 8)} is now IN TRANSIT across Bengaluru!`);
      }, 600);
    } else {
      setTimeout(() => {
        setDispatchSimulatorRunning(false);
        alert('All current orders are already dispatched or delivered!');
      }, 400);
    }
  };

  // RBAC Access Guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f9fa] dark:bg-[#090a0f] transition-colors">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#10121a] p-8 shadow-2xl border border-neutral-200 dark:border-white/10 text-center">
          <div className="h-16 w-16 rounded-3xl bg-red-500/10 text-[#e51e2b] flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Restricted Admin Area (RBAC)
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
            {user ? 'You are currently signed in as a customer.' : 'You are currently not signed in.'} Only verified Dspace Central Hub Administrators can manage silicon inventory, modify stock, and dispatch Bengaluru Porter couriers.
          </p>

          <div className="space-y-2.5">
            <Link
              href="/signin"
              className="block w-full py-3 px-4 rounded-xl bg-[#e51e2b] hover:bg-[#c91823] text-white text-xs font-bold shadow-md shadow-[#e51e2b]/25 transition-all text-center"
            >
              Sign In with Admin Account
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 transition-colors"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] dark:bg-[#07080c] text-neutral-900 dark:text-white flex flex-col md:flex-row transition-colors relative">
      {/* ── Mobile Backdrop Overlay ── */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      {/* ── 1. DEMOSTACK-STYLE COLLAPSIBLE SIDEBAR (SLIDE-IN ON MOBILE, STICKY ON DESKTOP) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:h-screen bg-white dark:bg-[#0c0d14] border-r border-neutral-200/80 dark:border-white/10 flex flex-col justify-between shrink-0 transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl w-72 max-w-[85vw]' : '-translate-x-full md:translate-x-0'
        } ${
          isSidebarCollapsed ? 'md:w-20' : 'md:w-64 lg:w-72'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="shrink-0 p-4 border-b border-neutral-200/80 dark:border-white/10 flex items-center justify-between gap-2">
          {!isSidebarCollapsed ? (
            <>
              <Link href="/admin" className="flex items-center gap-2 min-w-0" onClick={() => setIsMobileMenuOpen(false)}>
                <DspaceLogo size="sm" />
                <span className="text-[10px] font-mono font-bold bg-[#e51e2b]/15 text-[#e51e2b] px-2 py-0.5 rounded-md">
                  ADMIN
                </span>
              </Link>

              <div className="flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Toggle theme"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer hidden md:flex"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer md:hidden"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-3">
              <Link href="/admin" className="flex items-center justify-center p-1" title="Dspace Admin" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-7 h-7 rounded-lg bg-[#e51e2b] text-white flex items-center justify-center font-bold text-xs">
                  D
                </div>
              </Link>
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer hidden md:flex"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4 text-[#e51e2b]" />
              </button>
            </div>
          )}
        </div>

        {/* Hub Active Indicator */}
        {!isSidebarCollapsed ? (
          <div className="shrink-0 mx-4 my-3 p-2.5 rounded-2xl bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/80 dark:border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-xs leading-none">New Thippasandra Hub</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">BLR-EAST-01</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">ONLINE</span>
          </div>
        ) : (
          <div className="shrink-0 flex justify-center py-2">
            <span className="relative flex h-2.5 w-2.5" title="Central Hub: ONLINE">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
        )}

        {/* Navigation Sections (Scrollable middle area) */}
        <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto min-h-0">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
                Core Operations
              </p>
            )}

            <button
              onClick={() => {
                setActiveTab('overview');
                setIsMobileMenuOpen(false);
              }}
              title="Executive Overview"
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
              } ${
                activeTab === 'overview'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Executive Overview</span>}
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('orders');
                setIsMobileMenuOpen(false);
              }}
              title="Live Orders"
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
              } ${
                activeTab === 'orders'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Live Orders</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  pendingCount > 0
                    ? 'bg-[#e51e2b] text-white animate-pulse'
                    : 'bg-neutral-200 dark:bg-white/15 text-neutral-700 dark:text-neutral-300'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('dispatch');
                setIsMobileMenuOpen(false);
              }}
              title="Porter Dispatch"
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
              } ${
                activeTab === 'dispatch'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bike className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Porter Dispatch</span>}
              </div>
              {!isSidebarCollapsed && inTransitCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold">
                  {inTransitCount} live
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('inventory');
                setIsMobileMenuOpen(false);
              }}
              title="Silicon SKUs"
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
              } ${
                activeTab === 'inventory'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Silicon SKUs</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-mono text-neutral-400">
                  {products.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('analytics');
                setIsMobileMenuOpen(false);
              }}
              title="Revenue & Analytics"
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
              } ${
                activeTab === 'analytics'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Revenue &amp; Analytics</span>}
              </div>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer - Permanently Pinned Admin Profile & Storefront Return */}
        <div className="shrink-0 p-3 border-t border-neutral-200/80 dark:border-white/10 space-y-2 bg-white dark:bg-[#0c0d14]">
          {!isSidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between p-2 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0">
                    <Avatar
                      size={32}
                      name={user?.fullName || 'Admin'}
                      variant="beam"
                      colors={['#e51e2b', '#111827', '#3b82f6', '#10b981', '#f59e0b']}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate">{user?.fullName || 'Dspace Admin'}</span>
                    <span className="text-[10px] text-neutral-400 font-mono truncate">{user?.email || 'admin@dspace-blr.com'}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Customer Store</span>
              </Link>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0" title={user?.fullName || 'Dspace Admin'}>
                <Avatar
                  size={32}
                  name={user?.fullName || 'Admin'}
                  variant="beam"
                  colors={['#e51e2b', '#111827', '#3b82f6', '#10b981', '#f59e0b']}
                />
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href="/"
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 transition-colors"
                  title="Return to Customer Store"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── 2. MAIN DASHBOARD CANVAS ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Floating Action Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#07080c]/80 backdrop-blur-2xl border-b border-neutral-200/80 dark:border-white/10 px-4 sm:px-8 flex items-center justify-between gap-3 sm:gap-4 transition-colors">
          {/* Breadcrumb / Title & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors md:hidden shrink-0 cursor-pointer"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-neutral-400 font-mono uppercase tracking-wider hidden sm:inline">
              Control Center
            </span>
            <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">/</span>
            <h1 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white capitalize truncate">
              {activeTab === 'overview' && 'Executive Metrics & Live Hub Radar'}
              {activeTab === 'orders' && 'Real-Time Silicon Orders Pipeline'}
              {activeTab === 'dispatch' && 'Bengaluru Porter Rider Dispatch Pipeline'}
              {activeTab === 'inventory' && 'Silicon Inventory & Stock Management'}
              {activeTab === 'analytics' && 'Revenue & Hardware Demand Analytics'}
            </h1>
          </div>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Sync & Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
              title="Sync latest orders and products from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#e51e2b]' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            {/* Rapid Dispatch Simulation Button */}
            <button
              onClick={simulateFastDispatch}
              disabled={dispatchSimulatorRunning}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold cursor-pointer active:scale-[0.98] transition-all"
            >
              <Zap className={`w-3.5 h-3.5 fill-amber-500 text-amber-500 ${dispatchSimulatorRunning ? 'animate-bounce' : ''}`} />
              <span>{dispatchSimulatorRunning ? 'Dispatching...' : 'Dispatch Courier'}</span>
            </button>

            {/* Add SKU Button */}
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e51e2b] hover:bg-[#c91823] text-white text-xs font-bold shadow-md shadow-[#e51e2b]/25 cursor-pointer active:scale-[0.98] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add SKU</span>
            </button>
          </div>
        </header>

        {/* Dashboard Dynamic View Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ──────── TAB 1: OVERVIEW ──────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top 4 Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold">Total Revenue (Gross)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-neutral-950 dark:text-white font-mono">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+24.8% vs last week</span>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold">Active Porter Couriers</span>
                    <Bike className="w-4 h-4 text-[#e51e2b]" />
                  </div>
                  <div className="text-2xl font-extrabold text-neutral-950 dark:text-white font-mono">
                    {inTransitCount} in Transit
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
                    <span>Avg delivery time:</span>
                    <strong className="text-neutral-800 dark:text-neutral-200 font-mono">38 mins</strong>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold">Silicon SKUs Catalog</span>
                    <Boxes className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-neutral-950 dark:text-white font-mono">
                    {products.length} Items
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono">
                    <span>{totalStockUnits} total units stocked</span>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold">SLA Fulfillment Rate</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-neutral-950 dark:text-white font-mono">
                    99.4%
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    HAL Hub Zero Backlog
                  </div>
                </div>
              </div>

              {/* Bengaluru Zone Delivery Radar */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                      Bengaluru Porter Dispatch Zones (Live SLA Status)
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Dispatched direct from New Thippasandra Central Hub via 2-Wheeler courier
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full self-start">
                    ● ALL 5 ZONES CLEAR
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { zone: 'Indiranagar / Domlur', distance: '3.2 km', eta: '18 mins', fee: '₹75', status: 'Optimal' },
                    { zone: 'Koramangala / HSR', distance: '6.8 km', eta: '32 mins', fee: '₹95', status: 'Optimal' },
                    { zone: 'Bellandur / ORR Tech', distance: '9.4 km', eta: '44 mins', fee: '₹120', status: 'Fast' },
                    { zone: 'Whitefield / ITPL', distance: '14.2 km', eta: '58 mins', fee: '₹140', status: 'Active' },
                    { zone: 'Hebbal / Manyata', distance: '12.8 km', eta: '50 mins', fee: '₹135', status: 'Active' },
                  ].map((z) => (
                    <div
                      key={z.zone}
                      className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/70 dark:border-white/5 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{z.zone}</span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{z.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1">
                        <span>ETA: <strong className="text-neutral-900 dark:text-white">{z.eta}</strong></span>
                        <span>{z.fee}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Alerts & Quick Orders Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Low Stock Alerts (1 col) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Restock Triggers</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      {lowStockProducts.length} Alert{lowStockProducts.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {lowStockProducts.length > 0 ? (
                    <div className="space-y-2.5">
                      {lowStockProducts.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold truncate">{item.title}</p>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                              Only {item.stock ?? item.stockCount ?? 0} units remaining
                            </p>
                          </div>
                          <button
                            onClick={() => updateStock(item.id, (item.stock ?? item.stockCount ?? 0) + 20)}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-[10px] font-bold shrink-0 hover:opacity-80 transition-opacity"
                          >
                            +20 Restock
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      All {products.length} components are healthy in stock.
                    </div>
                  )}
                </div>

                {/* Recent Dispatched Orders (2 cols) */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                        Recent Lab &amp; Hardware Orders
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        {orders.length} total orders across Bengaluru
                      </p>
                    </div>
                    {orders.length > 0 && (
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-[#e51e2b] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>View All Orders ({orders.length})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-neutral-50/70 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5 space-y-2">
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        No orders recorded yet.
                      </p>
                      <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                        New orders placed by customers via Razorpay or Cash on Delivery will appear here instantly.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-neutral-200/80 dark:border-white/10 text-neutral-400 font-mono text-[10px] uppercase">
                            <th className="pb-2 font-bold">Order ID</th>
                            <th className="pb-2 font-bold">Customer</th>
                            <th className="pb-2 font-bold">Items</th>
                            <th className="pb-2 font-bold">Zone</th>
                            <th className="pb-2 font-bold">Total</th>
                            <th className="pb-2 font-bold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                          {orders.slice(0, 6).map((order) => (
                            <tr
                              key={order.id}
                              onClick={() => setActiveTab('orders')}
                              className="hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <td className="py-3 font-mono font-bold text-neutral-900 dark:text-white">
                                #{order.orderNumber || order.id.slice(0, 8)}
                              </td>
                              <td className="py-3">
                                <span className="font-semibold block">{order.customerName}</span>
                                <span className="text-[10px] text-neutral-400 font-mono">{order.phone}</span>
                              </td>
                              <td className="py-3">
                                <span className="text-[11px] text-neutral-600 dark:text-neutral-300 font-medium line-clamp-1">
                                  {order.items?.map((i) => `${i.quantity}x ${i.product.title.split(' ')[0]}`).join(', ') || 'Silicon components'}
                                </span>
                              </td>
                              <td className="py-3 text-neutral-500 capitalize">
                                {order.blrZone?.name || order.blrZone?.area || 'Indiranagar'}
                              </td>
                              <td className="py-3 font-mono font-bold text-[#e51e2b]">
                                ₹{(order.total || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 text-right">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    order.status === 'in_transit' || order.status === 'driver_assigned'
                                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                      : order.status === 'delivered'
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : order.status === 'packed'
                                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 animate-pulse'
                                  }`}
                                >
                                  {order.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ──────── TAB: LIVE ORDERS PIPELINE ──────── */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              {/* Filter and Search Toolbar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by Order ID, customer, phone, address, component..."
                    className="w-full pl-9 pr-4 py-2.5 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#e51e2b]"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'All Orders', count: orders.length },
                    { id: 'placed', label: 'Placed (New)', count: placedCount, highlight: placedCount > 0 },
                    { id: 'packed', label: 'Packed', count: packedCount },
                    { id: 'in_transit', label: 'In Transit', count: inTransitCount },
                    { id: 'delivered', label: 'Delivered', count: deliveredCount },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        orderStatusFilter === tab.id
                          ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          orderStatusFilter === tab.id
                            ? 'bg-white/20 dark:bg-black/20 text-current'
                            : tab.highlight
                            ? 'bg-[#e51e2b] text-white'
                            : 'bg-neutral-200 dark:bg-white/10 text-neutral-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List / Cards */}
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center mx-auto text-neutral-400">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">No Orders Found</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    {orderSearchQuery
                      ? `No orders matched your search query "${orderSearchQuery}".`
                      : 'No orders are currently in this status category.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4 transition-all"
                    >
                      {/* Card Header: Order Number, Time, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-base text-neutral-900 dark:text-white">
                            #{order.orderNumber || order.id}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                              order.status === 'in_transit' || order.status === 'driver_assigned'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : order.status === 'delivered'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : order.status === 'packed'
                                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                : 'bg-[#e51e2b]/15 text-[#e51e2b] border border-[#e51e2b]/30'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{order.status.replace('_', ' ').toUpperCase()}</span>
                          </span>

                          {order.status === 'placed' && (
                            <span className="px-2 py-0.5 rounded-md bg-[#e51e2b] text-white text-[10px] font-mono font-bold">
                              NEW ORDER
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString()} at{' '}
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                          <span className="font-mono font-extrabold text-base text-[#e51e2b]">
                            ₹{(order.total || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Main Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* Customer & Contact */}
                        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 space-y-1.5">
                          <p className="text-[10px] font-mono font-bold uppercase text-neutral-400">Customer Details</p>
                          <p className="font-bold text-neutral-900 dark:text-white text-sm">{order.customerName}</p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <a
                              href={`tel:${order.phone}`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-200/80 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 transition-colors font-mono"
                            >
                              <PhoneCall className="w-3 h-3 text-emerald-600" />
                              <span>{order.phone}</span>
                            </a>
                            {order.customerEmail && (
                              <span className="text-neutral-500 truncate">{order.customerEmail}</span>
                            )}
                          </div>
                        </div>

                        {/* Delivery Address & Zone */}
                        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 space-y-1.5">
                          <p className="text-[10px] font-mono font-bold uppercase text-neutral-400">Delivery Destination</p>
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#e51e2b] shrink-0 mt-0.5" />
                            <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                              {order.address}
                            </p>
                          </div>
                          <p className="text-[11px] font-mono text-neutral-500 pt-0.5">
                            Zone: <strong className="text-neutral-800 dark:text-neutral-200 capitalize">{order.blrZone?.name || order.blrZone?.area || 'Indiranagar'}</strong>
                          </p>
                        </div>

                        {/* Logistics & Porter Telemetry */}
                        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 space-y-1.5">
                          <p className="text-[10px] font-mono font-bold uppercase text-neutral-400">Porter Courier &amp; Rider</p>
                          <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
                            <Bike className="w-4 h-4 text-[#e51e2b]" />
                            <span className="font-mono font-bold">{order.porterTrackingId || 'PTR-BLR-AUTO'}</span>
                          </div>
                          <p className="text-[11px] text-neutral-500">
                            Rider: <strong className="text-neutral-800 dark:text-neutral-200">{order.porterRider?.name || 'Assigned Courier'}</strong> ({order.porterRider?.vehicleNumber || 'KA-01-EQ-4921'})
                          </p>
                          <div className="pt-1">
                            <Link
                              href={`/tracking/${order.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e51e2b] hover:underline"
                            >
                              <span>Open Live Telemetry Radar</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Items Ordered Breakdown */}
                      <div className="space-y-2 pt-1">
                        <p className="text-[10px] font-mono font-bold uppercase text-neutral-400">Ordered Silicon Components ({order.items?.length || 0})</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-50/70 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5"
                            >
                              <img
                                src={
                                  item.product?.images?.[0] ||
                                  item.product?.imageUrl ||
                                  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
                                }
                                alt={item.product?.title || 'Component'}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                                }}
                                className="w-9 h-9 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                  {item.product?.title}
                                </p>
                                <p className="text-[10px] font-mono text-neutral-500">
                                  {item.quantity}x @ ₹{item.product?.price} = ₹{(item.quantity * (item.product?.price || 0)).toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Controls & Actions Footer */}
                      <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-neutral-500 font-medium">
                            Payment: <strong className="text-neutral-900 dark:text-white uppercase">{order.paymentMethod?.replace('razorpay_', 'Razorpay ') || 'COD'}</strong>
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-700">•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono text-[11px]">
                            {order.paymentStatus === 'paid' ? 'PAID ✓' : 'CASH ON DELIVERY'}
                          </span>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="flex items-center gap-2">
                          {order.status === 'placed' && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'packed')}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                Mark Packed
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'in_transit')}
                                className="px-3.5 py-1.5 rounded-xl bg-[#e51e2b] hover:bg-[#c91823] text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Dispatch Porter</span>
                              </button>
                            </>
                          )}

                          {order.status === 'packed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'in_transit')}
                              className="px-3.5 py-1.5 rounded-xl bg-[#e51e2b] hover:bg-[#c91823] text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <Bike className="w-3.5 h-3.5" />
                              <span>Dispatch Porter 2-Wheeler</span>
                            </button>
                          )}

                          {(order.status === 'in_transit' || order.status === 'driver_assigned') && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Delivered</span>
                            </button>
                          )}

                          {order.status === 'delivered' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              <Check className="w-4 h-4" />
                              <span>DELIVERED &amp; CLOSED</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──────── TAB 2: INVENTORY MANAGEMENT ──────── */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by component title, SKU, specs, or category..."
                    className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-[#e51e2b]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  {['all', 'microcontrollers', 'sensors', 'power', 'actuators', 'tools'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Silicon Component Inventory Table */}
              <div className="rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-white/5 border-b border-neutral-200/80 dark:border-white/10 text-neutral-400 font-mono text-[10px] uppercase">
                        <th className="py-3.5 px-4 font-bold">Component Details</th>
                        <th className="py-3.5 px-3 font-bold">Category</th>
                        <th className="py-3.5 px-3 font-bold">Unit Price</th>
                        <th className="py-3.5 px-3 font-bold text-center">Warehouse Stock</th>
                        <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                      {filteredProducts.map((item) => {
                        const stockVal = item.stock ?? item.stockCount ?? 0;
                        return (
                          <tr key={item.id} className="hover:bg-neutral-50/70 dark:hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    item.images?.[0] ||
                                    item.imageUrl ||
                                    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
                                  }
                                  alt={item.title}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                                  }}
                                  className="w-10 h-10 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 shrink-0"
                                />
                                <div>
                                  <span className="font-bold text-neutral-900 dark:text-white block">
                                    {item.title}
                                  </span>
                                  <span className="text-[10px] font-mono text-neutral-400">
                                    SKU: {item.slug}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-white/10 font-mono text-[10px] font-bold capitalize text-neutral-700 dark:text-neutral-300">
                                {item.category}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                              ₹{item.price.toLocaleString('en-IN')}
                            </td>

                            <td className="py-3.5 px-3 text-center">
                              <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                                <button
                                  onClick={() => updateStock(item.id, Math.max(0, stockVal - 1))}
                                  className="w-6 h-6 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold flex items-center justify-center hover:bg-neutral-200 transition-colors cursor-pointer"
                                >
                                  -
                                </button>
                                <span className={`font-mono font-bold min-w-8 text-center text-xs ${
                                  stockVal <= 5 ? 'text-amber-500' : 'text-neutral-900 dark:text-white'
                                }`}>
                                  {stockVal}
                                </span>
                                <button
                                  onClick={() => updateStock(item.id, stockVal + 5)}
                                  className="w-6 h-6 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold flex items-center justify-center hover:bg-neutral-200 transition-colors cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/product/${item.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                                  title="View on Storefront"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove "${item.title}" from catalog?`)) {
                                      deleteProduct(item.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                                  title="Delete component"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ──────── TAB 3: PORTER DISPATCH ──────── */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                    Bangalore Porter Dispatch Center ({orders.length} Active Orders)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Real-time courier dispatch pipeline with live OTP verification
                  </p>
                </div>
                <button
                  onClick={simulateFastDispatch}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e51e2b] text-white text-xs font-bold hover:bg-[#c91823] cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Auto-Dispatch Next Courier</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center mx-auto text-neutral-400">
                    <Bike className="w-7 h-7 text-[#e51e2b]" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">No Active Dispatches</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    When customers place orders, assigned Porter 2-Wheeler riders and live GPS telemetry will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-white/5">
                          <span className="font-mono font-bold text-xs text-[#e51e2b]">
                            #{order.orderNumber || order.id.slice(0, 8)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              order.status === 'in_transit' || order.status === 'driver_assigned'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : order.status === 'delivered'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : order.status === 'packed'
                                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="pt-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white">
                              {order.customerName}
                            </p>
                            <a
                              href={`tel:${order.phone}`}
                              className="text-[10px] text-neutral-400 font-mono hover:text-emerald-500"
                            >
                              {order.phone}
                            </a>
                          </div>
                          <p className="text-xs text-neutral-500 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{order.address}</span>
                          </p>
                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
                            <span>Zone: <strong className="text-neutral-700 dark:text-neutral-300 capitalize">{order.blrZone?.name || order.blrZone?.area || 'Bengaluru Central'}</strong></span>
                            <span>{order.items?.length || 0} items</span>
                          </div>
                          <p className="text-[10px] font-mono text-neutral-500">
                            Porter: <span className="text-[#e51e2b] font-bold">{order.porterTrackingId || 'PTR-BLR-AUTO'}</span> ({order.porterRider?.name || 'Assigned Rider'})
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between gap-2">
                        <span className="font-mono font-extrabold text-sm text-neutral-950 dark:text-white">
                          ₹{(order.total || 0).toLocaleString('en-IN')}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/tracking/${order.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors"
                            title="Live Radar View"
                          >
                            <Navigation className="w-3.5 h-3.5 text-[#e51e2b]" />
                          </Link>
                          {order.status === 'placed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'packed')}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Pack Order
                            </button>
                          )}
                          {(order.status === 'placed' || order.status === 'packed') && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'in_transit')}
                              className="px-2.5 py-1.5 rounded-xl bg-[#e51e2b] hover:bg-[#c91823] text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Dispatch</span>
                            </button>
                          )}
                          {(order.status === 'in_transit' || order.status === 'driver_assigned') && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──────── TAB 4: REVENUE & ANALYTICS ──────── */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1017] border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Hardware Category Distribution &amp; Lab Demand
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'microcontrollers', label: 'Development Boards & SBCs', color: 'bg-[#e51e2b]' },
                    { key: 'sensors', label: 'Precision Sensors & Bosch IMUs', color: 'bg-emerald-500' },
                    { key: 'actuators', label: 'Displays & Motion Actuators', color: 'bg-blue-500' },
                    { key: 'tools', label: 'Lab Workbench & Soldering Tools', color: 'bg-amber-500' },
                  ].map((cat) => {
                    const count = products.filter((p) => p.category === cat.key).length;
                    const percent = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                    return (
                      <div key={cat.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{cat.label}</span>
                          <span className="font-mono text-neutral-500">{percent}% ({count} SKU{count !== 1 ? 's' : ''})</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-white/5 overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full transition-all`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      <AddProductModal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} />
    </div>
  );
}
