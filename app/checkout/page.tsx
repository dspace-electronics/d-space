'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Tag,
  Lock,
  MapPin,
  Building,
  Smartphone,
  Mail,
  User,
  Check,
  Zap,
  Crosshair,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useOrder } from '@/context/order-context';
import { useToast } from '@/context/toast-context';
import { useAuth } from '@/context/auth-context';
import { BLR_ZONES } from '@/lib/mock-data';
import { BLRZone, Order } from '@/lib/types';
import { getRandomPorterRider, getMilestonesForStatus, generatePorterTrackingId } from '@/lib/porter';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DispatchMap, LocationSelection } from '@/components/map/dispatch-map';

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
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
    clearCart,
  } = useCart();

  const { addOrder } = useOrder();
  const { success, error } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    company: '',
    gst: '',
    address: user?.defaultAddress || '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    landmark: '',
    pincode: '',
    paymentMethod: 'razorpay_upi' as 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'cod',
    upiId: '',
  });

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      error('Geolocation Not Supported', 'Your browser does not support GPS location.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationStatus('Detecting GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.street || addr.building || '';
            const houseNumber = addr.house_number ? `${addr.house_number}, ` : '';
            const areaName = addr.suburb || addr.neighbourhood || addr.city_district || addr.residential || '';
            const cityName = addr.city || addr.town || addr.municipality || 'Bengaluru';
            const stateName = addr.state || 'Karnataka';
            const pcode = addr.postcode || '';

            setFormData((prev) => ({
              ...prev,
              address: `${houseNumber}${road}`.trim() || prev.address || `${areaName}, ${cityName}`,
              area: areaName || prev.area,
              city: cityName,
              state: stateName,
              pincode: pcode || prev.pincode,
            }));
            setLocationStatus(`Location detected: ${areaName ? areaName + ', ' : ''}${cityName}`);
            success('Location Detected', 'Address auto-filled from your current GPS coordinates.');
          }
        } catch (err) {
          console.warn('Reverse geocode error:', err);
          setLocationStatus('GPS coordinates fetched.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        setLocationStatus(null);
        error('Location Access Denied', 'Please enter your address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const [promoInput, setPromoInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty, show empty state
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
          Please add electronics components to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold px-5 py-3 rounded-xl transition-colors"
        >
          Browse Component Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    if (res.success) {
      success('Promo Code Applied', res.message);
      setPromoInput('');
    } else {
      error('Promo Code Error', res.message);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep((prev) => (prev + 1) as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    const orderNum = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `DSP-${orderNum}`;
    const orderId = `dsp-ord-${orderNum}`;
    const trackingId = generatePorterTrackingId();
    const rider = getRandomPorterRider();

    // If Cash on Delivery, complete order directly without gateway modal
    if (formData.paymentMethod === 'cod') {
      const newOrder: Order = {
        id: orderId,
        orderNumber,
        userId: user?.id || 'guest_user',
        createdAt: new Date().toISOString(),
        items: [...items],
        subtotal,
        discount,
        deliveryFee,
        total,
        status: 'placed',
        shippingMethod: courierOption,
        courierService: courierOption,
        customerName: formData.fullName,
        customerEmail: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.area ? formData.area + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`,
        blrZone: selectedZone,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        paymentId: `cod_${orderNum}`,
        porterTrackingId: trackingId,
        porterRider: rider,
        estimatedDeliveryTime: `In ${selectedZone.deliveryEtaMinutes} mins via Porter`,
        deliveryMilestones: getMilestonesForStatus('placed', new Date().toISOString()),
      };

      addOrder(newOrder);
      clearCart();
      setIsSubmitting(false);
      success('Order Placed', `Order #${orderNumber} placed via Cash on Delivery!`);
      router.push(`/order-confirmation/${newOrder.id}`);
      return;
    }

    // Launch official Razorpay Checkout modal
    openRazorpayCheckout({
      amountInRupees: total,
      items,
      blrZoneId: selectedZone.id,
      promoCode: promoCode || undefined,
      courierOption,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      orderNumber,
      onSuccess: (paymentId) => {
        const newOrder: Order = {
          id: orderId,
          orderNumber,
          userId: user?.id || 'guest_user',
          createdAt: new Date().toISOString(),
          items: [...items],
          subtotal,
          discount,
          deliveryFee,
          total,
          status: 'placed',
          shippingMethod: courierOption,
          courierService: courierOption,
          customerName: formData.fullName,
          customerEmail: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.area ? formData.area + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`,
          blrZone: selectedZone,
          paymentMethod: formData.paymentMethod,
          paymentStatus: 'paid',
          paymentId,
          porterTrackingId: trackingId,
          porterRider: rider,
          estimatedDeliveryTime: `In ${selectedZone.deliveryEtaMinutes} mins via Porter`,
          deliveryMilestones: getMilestonesForStatus('placed', new Date().toISOString()),
        };

        addOrder(newOrder);
        clearCart();
        setIsSubmitting(false);
        success('Payment Verified', `Razorpay transaction #${paymentId} confirmed!`);
        router.push(`/order-confirmation/${newOrder.id}`);
      },
      onCancel: () => {
        setIsSubmitting(false);
        error('Checkout Dismissed', 'Razorpay payment was cancelled.');
      },
      onError: (errMessage) => {
        setIsSubmitting(false);
        error('Payment Failed', errMessage || 'Razorpay transaction failed.');
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16">
      {/* Admin Notice Banner if logged in as Admin */}
      {user?.role === 'admin' && (
        <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-950 text-white dark:from-white/10 dark:to-white/5 border border-neutral-800 dark:border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-[#e51e2b] animate-pulse shrink-0" />
            <p className="text-neutral-200">
              <strong className="text-white">Admin Session Active:</strong> You are currently testing the customer checkout flow as <span className="font-mono text-neutral-300">{user.email}</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg bg-[#e51e2b] text-white font-bold hover:bg-[#c91823] transition-colors"
            >
              Back to Admin Hub
            </Link>
          </div>
        </div>
      )}

      {/* Checkout Stepper Bar */}
      <div className="max-w-xl mx-auto mb-10 select-none">
        <div className="relative flex items-center justify-between">
          {/* Base Track */}
          <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-0.5 bg-neutral-200 dark:bg-white/10 z-0" />
          {/* Active Progress Track */}
          <div
            className="absolute left-4 top-4 -translate-y-1/2 h-0.5 bg-[#e51e2b] transition-all duration-300 z-0"
            style={{ width: `calc(${((step - 1) / 3)} * (100% - 32px))` }}
          />

          {[
            { num: 1, label: 'Information' },
            { num: 2, label: 'Shipping' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Review' },
          ].map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <button
                type="button"
                key={s.num}
                onClick={() => {
                  if (isDone) {
                    setStep(s.num as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={!isDone && !isCurrent}
                className={`relative z-10 flex flex-col items-center group transition-transform ${
                  isDone ? 'cursor-pointer hover:scale-105' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-[#e51e2b] text-white shadow-xs ring-4 ring-neutral-50 dark:ring-[#0e1117]'
                      : isCurrent
                      ? 'bg-[#e51e2b] text-white ring-4 ring-[#e51e2b]/30 shadow-md shadow-[#e51e2b]/30 scale-110'
                      : 'bg-white dark:bg-[#161b26] border-2 border-neutral-300 dark:border-white/20 text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <span
                  className={`text-[11px] sm:text-xs mt-2 transition-colors ${
                    isCurrent
                      ? 'text-neutral-950 dark:text-white font-bold'
                      : isDone
                      ? 'text-neutral-700 dark:text-neutral-300 font-semibold group-hover:text-[#e51e2b]'
                      : 'text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Interactive Form Area */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl text-neutral-900 dark:text-white">
          {/* STEP 1: INFORMATION */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Customer &amp; Contact Information</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  We use your phone number for live Porter courier SMS updates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Arjun Swaminathan"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Email (Tax Invoice)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.in"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Bengaluru Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-neutral-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-12 pr-3 py-2.5 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-mono"
                  />
                </div>
              </div>

              {/* Optional Company & GST for Startups */}
              <div className="pt-4 border-t border-neutral-200 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-950 dark:text-white">Lab / Startup Invoicing (Optional)</span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">GST Eligible</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Company / Lab Name</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Acme Tech Labs"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={formData.gst}
                      onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <span>Continue to Shipping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SHIPPING */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Delivery Address</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Enter your street address or auto-fill via your device location.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting GPS...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="w-3.5 h-3.5 text-[#e51e2b]" />
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>

              {locationStatus && (
                <div className="text-xs p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{locationStatus}</span>
                </div>
              )}

              {/* Direct Address Input Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Street Address / Flat No / Building
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Flat 304, Green Glen Layout, 5th Cross"
                    className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g. Bellandur / Indiranagar"
                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="e.g. 560103"
                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Karnataka"
                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="Near metro station, tech park gate, etc."
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </div>
              </div>

              {/* Interactive Dispatch Map preview */}
              <div className="rounded-2xl border border-neutral-200 dark:border-white/10 p-3 sm:p-4 bg-neutral-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Pin Location on Map
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                    Click anywhere to adjust pin
                  </span>
                </div>
                <DispatchMap
                  height="220px"
                  title="Delivery Destination"
                  showCardDetails={false}
                  onLocationSelect={(loc: LocationSelection) => {
                    setFormData((prev) => ({
                      ...prev,
                      area: loc.area || prev.area,
                      city: loc.city || prev.city,
                      pincode: loc.pincode || prev.pincode,
                      address: loc.address ? loc.address.split(',')[0] : prev.address,
                    }));
                  }}
                />
              </div>

              {/* Shipping Speed Choice */}
              <div className="space-y-2 pt-4 border-t border-neutral-200 dark:border-white/10">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Courier Option
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => setCourierOption('porter_2wheeler')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      courierOption === 'porter_2wheeler'
                        ? 'border-neutral-400 dark:border-white/30 bg-neutral-100 dark:bg-white/15 shadow-xs'
                        : 'border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 hover:border-neutral-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-[#e51e2b]" />
                      <div>
                        <p className="text-xs font-bold text-neutral-950 dark:text-white">
                          Porter 2-Wheeler Direct Dispatch
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          Estimated ETA: {selectedZone.deliveryEtaMinutes} minutes from HAL Hub
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-neutral-950 dark:text-white">
                      {deliveryFee === 0 ? 'FREE' : `₹${selectedZone.porterBikeFee}`}
                    </span>
                  </label>

                  <label
                    onClick={() => setCourierOption('porter_express')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      courierOption === 'porter_express'
                        ? 'border-neutral-400 dark:border-white/30 bg-neutral-100 dark:bg-white/15 shadow-xs'
                        : 'border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 hover:border-neutral-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <div>
                        <p className="text-xs font-bold text-neutral-950 dark:text-white">
                          Priority Porter Express (Jump Queue)
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          Immediate rider assignment within 3 minutes
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-neutral-950 dark:text-white">
                      ₹{selectedZone.expressDispatchFee}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Payment Method</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  100% secure payment through Razorpay with Instant UPI, Cards, or Cash on Delivery.
                </p>
              </div>

              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(val) => setFormData({ ...formData, paymentMethod: val as any })}
                className="space-y-3 gap-0"
              >
                {[
                  {
                    id: 'razorpay_upi',
                    name: 'Razorpay Instant UPI (GPay, PhonePe, Paytm)',
                    desc: 'Zero payment processing surcharge · Instant confirmation',
                    icon: Zap,
                  },
                  {
                    id: 'razorpay_card',
                    name: 'Credit / Debit Card',
                    desc: 'Visa, MasterCard, RuPay & Corporate Cards',
                    icon: CreditCard,
                  },
                  {
                    id: 'cod',
                    name: 'Cash on Porter Delivery (COD)',
                    desc: 'Pay cash or UPI directly to the Porter rider upon arrival',
                    icon: ShieldCheck,
                  },
                ].map((pm) => {
                  const isSelected = formData.paymentMethod === pm.id;
                  const Icon = pm.icon;
                  return (
                    <label
                      key={pm.id}
                      htmlFor={pm.id}
                      className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-neutral-400 dark:border-white/30 bg-neutral-100 dark:bg-white/15 shadow-xs ring-1 ring-neutral-400/30 dark:ring-white/20'
                          : 'border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 hover:border-neutral-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#e51e2b]' : 'text-neutral-400'}`} />
                          <div>
                            <p className="text-xs font-bold text-neutral-950 dark:text-white">{pm.name}</p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{pm.desc}</p>
                          </div>
                        </div>
                        <RadioGroupItem value={pm.id} id={pm.id} />
                      </div>

                      {isSelected && pm.id === 'razorpay_upi' && (
                        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-white/10">
                          <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Your Virtual Payment Address (UPI ID)
                          </label>
                          <input
                            type="text"
                            value={formData.upiId}
                            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                            placeholder="username@okaxis"
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 text-neutral-900 dark:text-white font-mono"
                          />
                        </div>
                      )}
                    </label>
                  );
                })}
              </RadioGroup>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <span>Review Order Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Review &amp; Place Your Hardware Order</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Verify dispatch address and click &ldquo;Confirm &amp; Place Order&rdquo; to dispatch the Porter rider.
                </p>
              </div>

              {/* Information Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-50 dark:bg-white/5 p-4 rounded-xl border border-neutral-200 dark:border-white/10">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                    Contact Details
                  </span>
                  <p className="font-bold text-neutral-950 dark:text-white mt-1">{formData.fullName}</p>
                  <p className="text-neutral-600 dark:text-neutral-400">{formData.email}</p>
                  <p className="text-neutral-600 dark:text-neutral-400 font-mono">+91 {formData.phone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                    Shipping Address
                  </span>
                  <p className="font-bold text-neutral-950 dark:text-white mt-1">{formData.address}</p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {formData.area ? `${formData.area}, ` : ''}{formData.city}, {formData.state} - {formData.pincode}
                  </p>
                  {formData.landmark && (
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">Landmark: {formData.landmark}</p>
                  )}
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    Fast Courier Dispatch
                  </p>
                </div>
              </div>

              {/* Items Preview */}
              <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-white/10">
                <span className="text-xs font-bold text-neutral-950 dark:text-white block">Purchased Silicon &amp; Tools</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100 dark:border-white/5 last:border-b-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.product?.images?.[0] || (item.product as any)?.imageUrl || fallbackImage}
                          alt={item.product?.title || 'Product'}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackImage;
                          }}
                          className="w-9 h-9 object-cover rounded-lg border border-neutral-200 dark:border-white/10 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-neutral-900 dark:text-white truncate">{item.product.title}</p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-950 dark:text-white shrink-0 ml-2">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-neutral-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Payment
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#e51e2b] hover:bg-[#c91823] active:scale-95 text-white text-xs font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-[#e51e2b]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Assigning Porter Rider...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm &amp; Place Order (₹{total.toLocaleString('en-IN')})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-5 sticky top-24">
          <div className="bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 rounded-2xl p-6 shadow-xl dark:shadow-2xl space-y-4 text-neutral-900 dark:text-white">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-white pb-3 border-b border-neutral-200 dark:border-white/10">
              Order Summary ({items.length} items)
            </h3>

            {/* Promo Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Coupon code (MAKER10)"
                  className="w-full pl-8 pr-2 py-2 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl uppercase font-mono text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/15 dark:hover:bg-white/20 text-neutral-900 dark:text-white text-xs font-bold rounded-xl border border-neutral-200 dark:border-white/10 cursor-pointer"
              >
                Apply
              </button>
            </form>

            {/* Active Promo */}
            {promoCode && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
                <span className="font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {promoCode} applied ({promoDiscount?.percent}% OFF)
                </span>
                <button
                  onClick={removePromoCode}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Breakdown */}
            <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-200 dark:border-white/10">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-neutral-950 dark:text-white">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount ({promoCode})</span>
                  <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Porter Courier ({selectedZone.name})</span>
                <span className="font-mono font-medium text-neutral-950 dark:text-white">
                  {deliveryFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated GST (18% included)</span>
                <span className="font-mono text-neutral-500 dark:text-neutral-400">₹{Math.round((total * 0.18) / 1.18)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-neutral-950 dark:text-white pt-3 border-t border-neutral-200 dark:border-white/10">
                <span>Total Due</span>
                <span className="font-mono text-lg text-neutral-950 dark:text-white">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-neutral-200 dark:border-white/10 space-y-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                <span>256-Bit SSL Encrypted Razorpay Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>ESD Protected Silicon Guaranteed Genuine</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>GST Tax Invoices for Startup Expense Claims</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
