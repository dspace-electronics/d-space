import { NextRequest, NextResponse } from 'next/server';
import { createBorzoDeliveryOrder } from '@/lib/borzo';

export async function POST(req: NextRequest) {
  try {
    const {
      orderNumber,
      destinationAddress,
      customerName,
      customerPhone,
      packageDescription,
      declaredValueInRupees,
    } = await req.json();

    if (!orderNumber || !destinationAddress || !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Order number, destination address, and phone are required' },
        { status: 400 }
      );
    }

    const result = await createBorzoDeliveryOrder({
      orderNumber,
      destinationAddress,
      customerName: customerName || 'Valued Customer',
      customerPhone,
      packageDescription: packageDescription || 'Dspace Electronic Microcontrollers',
      declaredValueInRupees: Number(declaredValueInRupees || 500),
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error creating Borzo dispatch order' },
      { status: 500 }
    );
  }
}

