'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bike, ShieldCheck, CreditCard, QrCode, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '@/context/cart-context';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { openRazorpayCheckout } from '@/lib/razorpay';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, selectedZone, courierOption, setCourierOption, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.defaultAddress || '');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'cod'>('razorpay_upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !address) {
      alert('Please fill out all address and contact fields for Bengaluru courier delivery.');
      return;
    }

    const orderNum = `DSP-${Math.floor(1000 + Math.random() * 9000)}`;

    // If COD, complete immediately
    if (paymentMethod === 'cod') {
      setIsProcessing(true);
      await completeOrderPlacement('cod_pay_id');
      return;
    }

    // Launch official Razorpay standard popup
    setIsProcessing(true);
    await openRazorpayCheckout({
      amountInRupees: total,
      customerName,
      customerPhone: phone,
      customerEmail: user?.email,
      orderNumber: orderNum,
      onSuccess: (paymentId) => {
        completeOrderPlacement(paymentId);
      },
      onCancel: () => {
        setIsProcessing(false);
      },
      onError: (errMsg) => {
        setIsProcessing(false);
        alert(`Payment error: ${errMsg || 'Could not complete Razorpay transaction.'}`);
      },
    });
  };

  const completeOrderPlacement = async (paymentId: string) => {
    try {
      const created = await placeOrder({
        customerName,
        phone,
        address: `${address}, ${selectedZone.name}, Bengaluru - ${selectedZone.pincode}`,
        blrZone: selectedZone,
        items,
        subtotal,
        deliveryFee,
        total,
        courierService: courierOption,
        paymentMethod,
        paymentId,
      });

      setConfirmedOrderId(created.id);
      setStep('success');
      clearCart();

      // Trigger celebration confetti
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e51e2b', '#10B981', '#3B82F6', '#F59E0B'],
      });
    } catch (err) {
      console.error('Order creation error:', err);
      alert('Could not place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToTracking = () => {
    onClose();
    router.push(`/tracking/${confirmedOrderId}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-200 z-10 p-6 sm:p-8"
        >
          {step === 'form' && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                    <Bike className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-950 display-title">
                      Express Bengaluru Checkout
                    </h3>
                    <p className="text-xs text-gray-500">
                      Dispatched via Porter 2-Wheeler to {selectedZone.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Recipient / Engineer Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number (For Porter Delivery Call)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-600 focus:bg-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bangalore Delivery Address (Room / Lab / Floor / Tech Park)
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Lab 4B, 3rd Floor, Incubator Block, Outer Ring Road"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-red-600 focus:bg-white focus:outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1 px-1">
                    <span>Selected Zone: <strong>{selectedZone.name}</strong> ({selectedZone.pincode})</span>
                    <span>Distance from New Thippasandra Central Hub: <strong>{selectedZone.hubDistanceKm} km</strong></span>
                  </div>
                </div>

                {/* Delivery Speed / Porter Courier Options */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Delivery Speed & Logistics
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Cheapest Porter 2-Wheeler Option */}
                    <div
                      onClick={() => setCourierOption('porter_2wheeler')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all apple-btn-press ${
                        courierOption === 'porter_2wheeler'
                          ? 'border-red-600 bg-red-50/70 shadow-2xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                          <Bike className="h-3.5 w-3.5 text-red-600" />
                          <span>Porter 2-Wheeler</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          Cheapest
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Standard bike courier • ~{selectedZone.deliveryEtaMinutes}m
                      </p>
                      <span className="text-xs font-bold text-gray-900 mt-1 block">
                        ₹{selectedZone.porterBikeFee}
                      </span>
                    </div>

                    {/* Porter Priority Express */}
                    <div
                      onClick={() => setCourierOption('porter_express')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all apple-btn-press ${
                        courierOption === 'porter_express'
                          ? 'border-red-600 bg-red-50/70 shadow-2xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          <span>Porter Express</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-gray-500">
                          Priority
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Direct EV bike • ~{Math.max(18, selectedZone.deliveryEtaMinutes - 10)}m
                      </p>
                      <span className="text-xs font-bold text-gray-900 mt-1 block">
                        ₹{selectedZone.expressDispatchFee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Razorpay Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Payment Gateway (Razorpay Secured)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'razorpay_upi', name: 'UPI / QR', icon: QrCode },
                      { id: 'razorpay_card', name: 'Cards', icon: CreditCard },
                      { id: 'razorpay_netbanking', name: 'NetBanking', icon: ShieldCheck },
                      { id: 'cod', name: 'Cash on Del.', icon: Bike },
                    ].map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id as any)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all apple-btn-press ${
                            isSelected
                              ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-2xs'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-4 w-4 mb-1" />
                          <span>{pm.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary Box */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-gray-500">
                    <span>Items Subtotal ({items.length})</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Porter Courier Fee</span>
                    <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total Amount Payable</span>
                    <span className="text-red-600">₹{total}</span>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-xs transition-all apple-btn-press disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Connecting to Razorpay & Assigning Porter...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{total} via Razorpay & Dispatch Porter</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}



          {step === 'success' && (
            /* Order Success View */
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 display-title mb-1">
                Order Confirmed!
              </h3>
              <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
                Your electronic components are being packed in ESD-shielded bags at our New Thippasandra Hub. Porter 2-Wheeler partner is being routed to your location.
              </p>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left mb-6 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-mono font-bold text-gray-900">{confirmedOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery To:</span>
                  <span className="font-semibold text-gray-900">{selectedZone.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Courier Partner:</span>
                  <span className="text-emerald-700 font-bold">Porter 2-Wheeler (Live Tracking Active)</span>
                </div>
              </div>

              <button
                onClick={handleGoToTracking}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-md apple-btn-press"
              >
                <span>Open Live Porter GPS Tracking</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
