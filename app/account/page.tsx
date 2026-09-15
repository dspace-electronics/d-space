'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Building,
  Mail,
  Smartphone,
  Check,
  LayoutDashboard,
  RefreshCw,
  Boxes,
  Activity,
  Compass,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/order-context';
import { useWishlist } from '@/context/wishlist-context';
import { useToast } from '@/context/toast-context';
import { useAuth } from '@/context/auth-context';
import Avatar from 'boring-avatars';
import { UserAddress, Order, CartItem } from '@/lib/types';

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAdmin, logout, updateProfile, isLoadingAuth } = useAuth();
  const { orders } = useOrder();
  const { wishlist, totalWishlistItems } = useWishlist();
  const { success } = useToast();

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.push('/signin?redirect=/account');
    }
  }, [isLoadingAuth, user, router]);

  const [profileData, setProfileData] = useState({
    name: user?.fullName || '',
    phone: user?.phone || '',
    companyName: '',
    gstin: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.fullName || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateProfile) {
      updateProfile({
        fullName: profileData.name,
        phone: profileData.phone,
      });
    }
    success('Profile Updated', 'Maker profile details saved successfully.');
  };

  // Real-time user orders: only show orders placed by this user (or all if admin)
  const userOrders = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return orders;
    return orders.filter(
      (o) =>
        (user.id && o.userId === user.id) ||
        (user.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase())
    );
  }, [orders, user]);

  const handleLogout = () => {
    logout();
    success('Signed Out', 'You have been securely signed out.');
    router.push('/signin');
  };

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'payments' | 'preferences'>('orders');

  // Saved addresses state (localStorage backed)
  const [addresses, setAddresses] = useState<UserAddress[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dspace_saved_addresses');
      if (saved) {
        setAddresses(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Lab' as 'Lab' | 'Office' | 'Home' | 'Workshop',
    fullName: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    pincode: '',
    phone: '',
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const created: UserAddress = {
      id: `addr-${Date.now()}`,
      ...newAddr,
      isDefault: addresses.length === 0,
    };
    const updated = [...addresses, created];
    setAddresses(updated);
    try {
      localStorage.setItem('dspace_saved_addresses', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setIsAddAddressOpen(false);
    setNewAddr({ label: 'Lab', fullName: '', street: '', area: '', city: 'Bengaluru', pincode: '', phone: '' });
    success('Address Added', 'New Bengaluru address saved.');
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    try {
      localStorage.setItem('dspace_saved_addresses', JSON.stringify(updated));
    } catch {
      // ignore
    }
    success('Address Deleted', 'Address removed from your profile.');
  };

  const [adminTab, setAdminTab] = useState<'overview' | 'node_config' | 'staff_creds'>('overview');

  // Loading state while auth initializes
  if (isLoadingAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
          Verifying workstation credentials...
        </p>
      </div>
    );
  }

  // Unauthenticated Gate
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#0e1117] p-8 sm:p-10 shadow-2xl border border-neutral-200 dark:border-white/10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-[#6366f1] flex items-center justify-center mx-auto border border-[#6366f1]/20 shadow-xs">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">
              Authentication Required
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Please sign in to view your Bengaluru Porter orders, item receipts, saved lab addresses, and telemetry dispatch history.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href="/signin?redirect=/account"
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold shadow-md shadow-[#6366f1]/25 transition-all"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/signup"
              className="flex items-center justify-center w-full py-3 px-4 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-white/10 text-xs font-semibold border border-neutral-200 dark:border-white/10 transition-colors"
            >
              <span>Create New Maker Account</span>
            </Link>

            <Link
              href="/"
              className="inline-block text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 pt-2 transition-colors"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16 space-y-8">
      {/* Top Profile Header Banner */}
      <div className="bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl text-neutral-900 dark:text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl ring-2 ring-neutral-200 dark:ring-white/15 overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center shrink-0 shadow-inner">
              <Avatar
                size={56}
                name={user?.fullName || user?.email || 'Dspace Staff'}
                variant="beam"
                colors={user?.role === 'admin' ? ['#e51e2b', '#111827', '#f59e0b', '#10b981', '#ffffff'] : ['#e51e2b', '#111827', '#3b82f6', '#10b981', '#f59e0b']}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white">
                  {user?.fullName || (user?.role === 'admin' ? 'Dspace Central Hub Admin' : 'Hardware Engineer')}
                </h1>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  user?.role === 'admin'
                    ? 'bg-[#e51e2b] text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/15'
                }`}>
                  {user?.role === 'admin' ? 'Admin Hub' : 'Pro Lab Tier'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {user?.email || 'admin@dspace-blr.com'} · {user?.role === 'admin' ? 'Central Fulfillment Node #1 (HAL / Indiranagar)' : 'Verified Bengaluru Dispatch'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {user?.role === 'admin' ? (
              <Link
                href="/admin"
                className="text-xs font-bold px-4 py-2 rounded-xl bg-[#e51e2b] hover:bg-[#c91823] text-white shadow-md shadow-[#e51e2b]/25 transition-all flex items-center gap-1.5 active:scale-[0.98]"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            ) : (
              <Link
                href="/wishlist"
                className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                Wishlist ({totalWishlistItems})
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-neutral-400" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= IF LOGGED IN AS ADMIN: CENTRAL HUB OPERATIONS VIEW ================= */}
      {user?.role === 'admin' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Admin Sidebar */}
          <aside className="lg:col-span-3 bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 rounded-2xl p-2 sm:p-2.5 shadow-xl dark:shadow-2xl flex flex-row lg:flex-col overflow-x-auto no-scrollbar gap-1.5 shrink-0">
            <Link
              href="/admin"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#e51e2b] text-white shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full gap-2 mb-1"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Console</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {[
              { id: 'overview', label: 'Hub Operations & Health', icon: ShieldCheck },
              { id: 'node_config', label: 'Fulfillment Node Details', icon: Building },
              { id: 'staff_creds', label: 'Security & Access Logs', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id as any)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full gap-2 ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-white/15 text-neutral-950 dark:text-white font-semibold shadow-2xs border border-neutral-200 dark:border-white/10'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#e51e2b]' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Admin Content Area */}
          <div className="lg:col-span-9 bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl text-neutral-900 dark:text-white">
            {adminTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white">Hub Operations Overview</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Bengaluru Central Dispatch Node telemetry and operational gateways.
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Node Online (100% SLA)
                  </span>
                </div>

                {/* Quick Gateways */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    href="/admin"
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-[#e51e2b]/40 hover:bg-[#e51e2b]/5 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#e51e2b]/10 text-[#e51e2b] flex items-center justify-center mb-3">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-950 dark:text-white group-hover:text-[#e51e2b] transition-colors">
                      Inventory Ledger
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Update component stock levels, pricing, and bin allocations.
                    </p>
                  </Link>

                  <Link
                    href="/admin"
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-950 dark:text-white group-hover:text-amber-500 transition-colors">
                      Live Porter Dispatch
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Manage rider assignments and live telemetry for Bengaluru zones.
                    </p>
                  </Link>

                  <Link
                    href="/admin"
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-950 dark:text-white group-hover:text-emerald-500 transition-colors">
                      Sales &amp; Analytics
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Commercial revenue metrics, category margins, and daily orders.
                    </p>
                  </Link>
                </div>

                {/* Hub Metrics Card */}
                <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-white/5 border border-neutral-200 dark:border-white/10 space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Active Operational State
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-neutral-200/80 dark:border-white/10">
                      <span className="text-lg font-mono font-bold text-neutral-950 dark:text-white">30 Min</span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">Average SLA</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-neutral-200/80 dark:border-white/10">
                      <span className="text-lg font-mono font-bold text-neutral-950 dark:text-white">12/12</span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">Active Zones</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-neutral-200/80 dark:border-white/10">
                      <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">99.8%</span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">Fulfillment Rate</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-neutral-200/80 dark:border-white/10">
                      <span className="text-lg font-mono font-bold text-[#e51e2b]">ESD Safe</span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">Packaging Standard</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'node_config' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-neutral-200 dark:border-white/10">
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white">Central Hub Node Configuration</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Physical dispatch center and routing zone credentials.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5 space-y-1">
                    <span className="font-bold text-neutral-950 dark:text-white block">Primary Warehouse &amp; Dispatch Facility:</span>
                    <p className="text-neutral-600 dark:text-neutral-300 font-mono">
                      1273, First Floor, 2nd Cross, HAL 3rd Stage, New Thippasandra PO, Bengaluru 560075
                    </p>
                    <p className="text-neutral-400 text-[11px] pt-1">
                      Coordinates: 12.9719° N, 77.6412° E · Rapid access to Indiranagar, Koramangala, and Outer Ring Road.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5 space-y-1">
                    <span className="font-bold text-neutral-950 dark:text-white block">Express Courier Fleet:</span>
                    <p className="text-neutral-600 dark:text-neutral-300">
                      Porter 2-Wheeler On-Demand API Integration · Dedicated ESD delivery thermal boxes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'staff_creds' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-neutral-200 dark:border-white/10">
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white">Security &amp; Administrator Privileges</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Role-Based Access Control (RBAC) security profile.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-950 dark:text-white">Role Tier:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#e51e2b] text-white font-mono font-bold text-[10px]">
                      SUPER_ADMIN / HUB_ROOT
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-950 dark:text-white">Catalog Modification:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Granted (Create, Update, Adjust Stock)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-950 dark:text-white">Dispatch Logistics Control:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Granted (Dispatch, Reassign Rider, Cancel)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-950 dark:text-white">Customer Shopping Cart:</span>
                    <span className="text-neutral-500 dark:text-neutral-400">Disabled for Admin session (Store Management Mode)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= IF LOGGED IN AS CUSTOMER / MAKER ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 rounded-2xl p-2 sm:p-2.5 shadow-xl dark:shadow-2xl flex flex-row lg:flex-col overflow-x-auto no-scrollbar gap-1.5 shrink-0">
            {[
              { id: 'orders', label: 'Orders & Tracking', icon: Package, badge: userOrders.length },
              { id: 'profile', label: 'Maker Profile & GST', icon: User },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin, badge: addresses.length },
              { id: 'payments', label: 'Payment Methods', icon: CreditCard },
              { id: 'preferences', label: 'Lab Preferences', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full gap-2 ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-white/15 text-neutral-950 dark:text-white font-semibold shadow-2xs border border-neutral-200 dark:border-white/10'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#e51e2b]' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-neutral-200 dark:bg-white/20 text-neutral-950 dark:text-white' : 'bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Right Content Area */}
          <div className="lg:col-span-9 bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl text-neutral-900 dark:text-white">
          {/* TAB 1: ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-white/10">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white">Recent Orders &amp; Dispatch History</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Track live Porter 2-Wheeler delivery telemetry in real time.
                  </p>
                </div>
              </div>

              {userOrders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-950 dark:text-white">No orders placed yet</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 mb-4">
                    Explore our silicon catalog and get chips delivered in 30 minutes.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Explore Components
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((ord: Order) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-colors space-y-4 bg-neutral-50/60 dark:bg-white/5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-white/10 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-neutral-950 dark:text-white">#{ord.orderNumber}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                              {ord.status === 'placed' ? 'Dispatched' : ord.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5 block">
                            Placed {new Date(ord.createdAt).toLocaleDateString('en-IN')} · Porter Courier to {ord.blrZone.name}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="font-mono font-bold text-neutral-950 dark:text-white text-sm block">
                            ₹{ord.total.toLocaleString('en-IN')}
                          </span>
                          <Link
                            href={`/order-confirmation/${ord.orderNumber}`}
                            className="text-[11px] font-semibold text-[#e51e2b] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Live Tracking</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Purchased Items List */}
                      <div className="space-y-2">
                        {ord.items.map((it: CartItem) => (
                          <div key={it.product.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={it.product?.images?.[0] || (it.product as any)?.imageUrl || fallbackImage}
                                alt={it.product?.title || 'Product'}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = fallbackImage;
                                }}
                                className="w-8 h-8 object-cover rounded-lg border border-neutral-200 dark:border-white/10 shrink-0"
                              />
                              <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                {it.product.title}
                              </span>
                              <span className="text-neutral-400 font-mono text-[11px]">x{it.quantity}</span>
                            </div>
                            <span className="font-mono text-neutral-950 dark:text-white font-semibold shrink-0 ml-2">
                              ₹{(it.product.price * it.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE & GST */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200 dark:border-white/10">
                <h3 className="text-base font-bold text-neutral-950 dark:text-white">Maker Profile &amp; GST Tax Credentials</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Update your contact details and B2B GSTIN number for tax invoices.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">Phone (+91)</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl text-neutral-500 dark:text-neutral-400 cursor-not-allowed font-medium"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">Authentication email address cannot be modified</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">Organization / Lab Name</label>
                    <input
                      type="text"
                      value={profileData.companyName}
                      onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                      placeholder="e.g. Acme Robotics R&D Lab"
                      className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">GSTIN Number (Optional)</label>
                    <input
                      type="text"
                      value={profileData.gstin}
                      onChange={(e) => setProfileData({ ...profileData, gstin: e.target.value.toUpperCase() })}
                      placeholder="29AAAAA0000A1Z5"
                      className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-white/10">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white">Saved Laboratory &amp; Office Addresses</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Speed up checkout with pre-saved Bengaluru workbench locations.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddAddressOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#e51e2b] hover:bg-[#c91823] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              </div>

              {/* Add Address Form Modal */}
              {isAddAddressOpen && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-5 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl space-y-3 text-xs"
                >
                  <h4 className="font-bold text-neutral-950 dark:text-white">Add New Bengaluru Delivery Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Contact Name"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="px-3 py-2 border border-neutral-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="px-3 py-2 border border-neutral-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Street Address / Room / Floor"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Area (e.g. HSR Sector 1)"
                      value={newAddr.area}
                      onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                      className="px-3 py-2 border border-neutral-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Pincode (e.g. 560102)"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="px-3 py-2 border border-neutral-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-mono"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddAddressOpen(false)}
                      className="px-3 py-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold rounded-xl cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-neutral-200 dark:border-white/10 rounded-2xl bg-neutral-50/40 dark:bg-white/[0.02]">
                  <MapPin className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-semibold text-neutral-950 dark:text-white">No Saved Addresses</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                    Save your laboratory, office, or workshop address in Bengaluru for rapid 1-click checkout.
                  </p>
                  <button
                    onClick={() => setIsAddAddressOpen(true)}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Delivery Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-200/70 dark:bg-white/10 text-neutral-800 dark:text-neutral-300 px-2 py-0.5 rounded">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-neutral-950 dark:text-white">{addr.fullName}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                      <p className="text-xs font-mono text-neutral-500">{addr.phone}</p>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-neutral-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT METHODS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200 dark:border-white/10">
                <h3 className="text-base font-bold text-neutral-950 dark:text-white">Payment Security &amp; Vault</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  PCI-DSS Level 1 compliant payments powered by Razorpay.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-950 dark:text-white">Razorpay Secure Tokenized Vault</h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                      Dspace does not store sensitive card numbers or UPI PINs on local servers. All payment transactions (UPI, Corporate Credit/Debit Cards, NetBanking, and Wallets) are processed through RBI-authorized Razorpay encryption.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-neutral-400" />
                    UPI &amp; Corporate Cards Tokenized on Checkout
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                    PCI-DSS Level 1
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200 dark:border-white/10">
                <h3 className="text-base font-bold text-neutral-950 dark:text-white">Laboratory Dispatch Preferences</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Customize packaging and courier communications.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5">
                  <div>
                    <p className="font-bold text-neutral-950 dark:text-white">ESD Antistatic Double-Sealing</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                      Include desiccants and conductive foam for delicate MOS transistors
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5">
                  <div>
                    <p className="font-bold text-neutral-950 dark:text-white">WhatsApp Porter Tracking Updates</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                      Send live GPS link when the 2-Wheeler courier leaves the HAL Hub
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5">
                  <div>
                    <p className="font-bold text-neutral-950 dark:text-white">Automated Monthly GST Invoices</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                      Send cumulative CSV summary to accounting department on the 1st of every month
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
