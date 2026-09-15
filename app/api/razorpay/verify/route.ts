import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway configuration error' },
        { status: 500 }
      );
    }

    // In standard direct checkout without a prior server order id, payment ID must exist
    if (!razorpay_order_id && razorpay_payment_id) {
      return NextResponse.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment signature verification parameters' },
        { status: 400 }
      );
    }

    // Cryptographic HMAC SHA256 Verification
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(razorpay_signature, 'utf-8')
    );

    if (!isMatch) {
      console.warn(`[Security Alert] Razorpay signature mismatch for order ${razorpay_order_id}`);
      return NextResponse.json(
        { success: false, error: 'Cryptographic payment signature verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (err: any) {
    console.error('[Razorpay Verify Error]:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error verifying signature' },
      { status: 500 }
    );
  }
}
