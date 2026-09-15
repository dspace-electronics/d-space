import { CartItem } from '@/lib/types';

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (resp: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key?: string;
  amount: number; // in paise (e.g. ₹100 = 10000)
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script from checkout.razorpay.com');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initiates the official Razorpay Checkout modal with server-side price validation & cryptographic HMAC verification.
 */
export async function openRazorpayCheckout({
  amountInRupees,
  items,
  blrZoneId,
  promoCode,
  courierOption,
  customerName,
  customerPhone,
  customerEmail,
  orderNumber,
  onSuccess,
  onCancel,
  onError,
}: {
  amountInRupees: number;
  items?: CartItem[];
  blrZoneId?: string;
  promoCode?: string;
  courierOption?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderNumber: string;
  onSuccess: (paymentId: string) => void;
  onCancel?: () => void;
  onError?: (errMessage: string) => void;
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    if (onError) onError('Could not load Razorpay gateway. Please check your internet connection.');
    return;
  }

  try {
    const res = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInRupees,
        items,
        blrZoneId,
        promoCode,
        courierOption,
        customerName,
        customerPhone,
        customerEmail,
        orderNumber,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const msg = data.error || 'Failed to create order with Razorpay server.';
      if (onError) onError(msg);
      return;
    }

    const { orderId, keyId, amount } = data;

    const options: RazorpayOptions = {
      key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount: amount || Math.round(amountInRupees * 100),
      currency: 'INR',
      name: 'Dspace Electronics',
      description: `Bengaluru Porter Dispatch — Order #${orderNumber}`,
      image: '/dspace-logo.jpeg',
      order_id: orderId,
      handler: async function (response) {
        try {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderNumber,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            onSuccess(response.razorpay_payment_id);
          } else {
            const err = verifyData.error || 'Cryptographic payment signature validation failed.';
            console.warn('Payment verification issue:', err);
            if (onError) onError(err);
          }
        } catch (vErr) {
          console.error('Error during signature verification:', vErr);
          if (onError) onError('Verification request failed. Please check order status.');
        }
      },
      prefill: {
        name: customerName,
        contact: customerPhone,
        email: customerEmail || 'customer@dspace-blr.com',
      },
      notes: {
        store_location: 'New Thippasandra Hub, Bengaluru',
        courier: 'Porter 2-Wheeler Express',
        order_number: orderNumber,
      },
      theme: {
        color: '#e51e2b',
      },
      modal: {
        ondismiss: () => {
          if (onCancel) onCancel();
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', function (resp: { error?: { description?: string } }) {
      console.warn('Razorpay payment failed or was declined:', resp.error);
      if (onError) {
        onError(resp.error?.description || 'Payment was declined by bank/UPI.');
      } else if (onCancel) {
        onCancel();
      }
    });

    rzp.open();
  } catch (err) {
    const error = err as Error;
    console.error('Razorpay initialization exception:', error);
    if (onError) onError(error.message || 'Razorpay initialization failed.');
  }
}
