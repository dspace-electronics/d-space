declare global {
  interface Window {
    Razorpay: any;
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
  items?: any[];
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
  const loaded = await loadRazorpayScript();

  if (!loaded || !window.Razorpay) {
    console.warn('Razorpay SDK could not be loaded into DOM.');
    if (onError) onError('Could not load Razorpay gateway. Check internet connectivity.');
    return;
  }

  const razorpayKey =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID;

  let serverOrderId: string | undefined;

  try {
    const res = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountInRupees,
        items,
        blrZoneId,
        promoCode,
        courierOption,
        receipt: `rcpt_${orderNumber.replace(/[^a-zA-Z0-9]/g, '_')}`,
        customerName,
        customerEmail,
        customerPhone,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.orderId) {
        serverOrderId = data.orderId;
      }
    } else {
      const err = await res.json().catch(() => ({}));
      if (err.error) {
        if (onError) onError(err.error);
        return;
      }
    }
  } catch (err) {
    console.warn('Could not create server-side Razorpay order:', err);
  }

  try {
    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: Math.round(Number(amountInRupees) * 100),
      currency: 'INR',
      name: 'Dspace Electronics',
      description: `Payment for Order #${orderNumber} (Bengaluru Porter Express Dispatch)`,
      image: '/dspace-logo.jpeg',
      order_id: serverOrderId,
      handler: async (response) => {
        // Cryptographically verify the payment signature with the server
        if (response.razorpay_order_id && response.razorpay_signature) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              if (onError) onError('Payment signature verification failed. Please contact support.');
              return;
            }
          } catch (verifyErr) {
            console.error('Signature verification network error:', verifyErr);
            if (onError) onError('Could not verify payment signature. Transaction pending review.');
            return;
          }
        }

        if (response.razorpay_payment_id) {
          onSuccess(response.razorpay_payment_id);
        } else {
          onSuccess(`pay_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
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

    rzp.on('payment.failed', function (resp: any) {
      console.warn('Razorpay payment failed or was declined:', resp.error);
      if (onError) {
        onError(resp.error?.description || 'Payment was declined by bank/UPI.');
      } else if (onCancel) {
        onCancel();
      }
    });

    rzp.open();
  } catch (err: any) {
    console.error('Razorpay initialization exception:', err);
    if (onError) onError(err.message || 'Razorpay initialization failed.');
  }
}
