import { NextRequest, NextResponse } from 'next/server';
import { calculateBorzoDeliveryQuote } from '@/lib/borzo';

export async function POST(req: NextRequest) {
  try {
    const { destinationAddress, customerName, customerPhone, subtotalInRupees } = await req.json();

    if (!destinationAddress) {
      return NextResponse.json(
        { success: false, error: 'Destination address is required' },
        { status: 400 }
      );
    }

    const quote = await calculateBorzoDeliveryQuote({
      destinationAddress,
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '+91 99999 99999',
      subtotalInRupees: Number(subtotalInRupees || 0),
    });

    return NextResponse.json(quote);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error calculating Borzo quote' },
      { status: 500 }
    );
  }
}

