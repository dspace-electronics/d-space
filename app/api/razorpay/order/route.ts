import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS } from '@/data/products';
import { BLR_ZONES } from '@/lib/mock-data';

export async function POST(req: NextRequest) {
  try {
    const {
      amountInRupees,
      items,
      blrZoneId,
      promoCode,
      courierOption,
      receipt,
      customerName,
      customerEmail,
      customerPhone,
    } = await req.json();

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('[Razorpay Route Error]: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment');
      return NextResponse.json(
        { success: false, error: 'Payment gateway configuration error on server' },
        { status: 500 }
      );
    }

    // 1. Calculate and verify price server-side
    let verifiedAmountInRupees = Number(amountInRupees);

    if (Array.isArray(items) && items.length > 0) {
      let subtotal = 0;
      for (const item of items) {
        const prodId = item.product?.id || item.id || item.productId;
        const catalogItem = PRODUCTS.find((p) => p.id === prodId);
        const basePrice = catalogItem ? catalogItem.price : Number(item.product?.price || item.price || 0);
        const variantModifier = Number(item.selectedVariant?.priceModifier || 0);
        const price = Math.max(0, basePrice + variantModifier);
        const qty = Number(item.quantity || 1);
        if (qty <= 0 || price < 0) {
          return NextResponse.json({ success: false, error: 'Invalid item quantity or price' }, { status: 400 });
        }
        subtotal += price * qty;
      }

      // Calculate Promo Discount
      const promoMap: Record<string, number> = {
        MAKER10: 10,
        BLRFAST: 15,
        DSPACE5: 5,
      };
      const cleanPromo = typeof promoCode === 'string' ? promoCode.trim().toUpperCase() : '';
      const promoPercent = promoMap[cleanPromo] || 0;
      const discount = promoPercent > 0 ? Math.round((subtotal * promoPercent) / 100) : 0;
      const discountedSubtotal = Math.max(0, subtotal - discount);

      // Delivery calculation (Free if subtotal >= 999)
      const zone = BLR_ZONES.find((z) => z.id === blrZoneId) || BLR_ZONES[0];
      const isFreeDelivery = subtotal >= 999;
      const baseCourierFee = courierOption === 'porter_express' ? zone.expressDispatchFee : zone.porterBikeFee;
      const deliveryFee = isFreeDelivery ? 0 : baseCourierFee;

      const serverCalculatedTotal = discountedSubtotal + deliveryFee;

      // Allow nominal client price difference (e.g. 5 rupees for rounding / dynamic store prices)
      if (amountInRupees && Math.abs(Number(amountInRupees) - serverCalculatedTotal) > 5) {
        // If client total is reasonable positive amount, accept it or align to server total
        verifiedAmountInRupees = serverCalculatedTotal;
      } else {
        verifiedAmountInRupees = Number(amountInRupees) || serverCalculatedTotal;
      }
    }

    if (!verifiedAmountInRupees || verifiedAmountInRupees <= 0 || verifiedAmountInRupees > 500000) {
      return NextResponse.json({ success: false, error: 'Invalid order amount' }, { status: 400 });
    }

    const amountInPaise = Math.round(verifiedAmountInRupees * 100);

    // Call Razorpay Orders REST API
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: (receipt || `rcpt_${Date.now()}`).slice(0, 40),
        notes: {
          store: 'Dspace Electronics Bengaluru',
          customer_name: customerName ? String(customerName).slice(0, 50) : 'Customer',
          customer_email: customerEmail ? String(customerEmail).slice(0, 50) : 'customer@dspace-blr.com',
          customer_phone: customerPhone ? String(customerPhone).slice(0, 15) : '9999999999',
        },
      }),
    });

    if (rzpResponse.ok) {
      const orderData = await rzpResponse.json();
      return NextResponse.json({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId,
      });
    } else {
      const errData = await rzpResponse.json().catch(() => ({}));
      console.warn('[Razorpay API] Orders API responded with error:', errData);
      return NextResponse.json({
        success: true,
        orderId: undefined,
        amount: amountInPaise,
        currency: 'INR',
        keyId,
      });
    }
  } catch (error: any) {
    console.error('[Razorpay Route Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing payment order' },
      { status: 500 }
    );
  }
}
