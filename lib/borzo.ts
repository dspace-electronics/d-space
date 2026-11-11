/**
 * Borzo (formerly WeFast) Business Delivery API Integration for Dspace Electronics
 * Enables on-demand hyper-local 2-wheeler deliveries across Bengaluru.
 *
 * Official Docs: https://borzodelivery.com/in/business-api
 */

export interface BorzoAddressPoint {
  address: string;
  contact_person: {
    name: string;
    phone: string;
  };
  client_order_id?: string;
  latitude?: number;
  longitude?: number;
  comment?: string;
}

export interface BorzoOrderPayload {
  matter: string; // e.g. "Electronic Components & Dev Boards"
  vehicle_type_id: number; // 7 = Motorbike / 2-wheeler in India
  points: BorzoAddressPoint[];
  insurance_amount?: number;
  is_client_notification_enabled?: boolean;
}

export interface BorzoCalculationResponse {
  is_successful: boolean;
  order?: {
    delivery_fee_amount: string;
    payment_amount: string;
    currency: string;
  };
  parameter_warnings?: any;
  errors?: string[];
}

export interface BorzoCreateOrderResponse {
  is_successful: boolean;
  order?: {
    order_id: number;
    order_name: string;
    status: string;
    delivery_fee_amount: string;
    tracking_url?: string;
    courier?: {
      name: string;
      phone: string;
    };
  };
  errors?: string[];
}

// Dspace Warehouse Pickup Configuration (New Thippasandra, HAL 3rd Stage, Bengaluru)
export const DSPACE_WAREHOUSE_BORZO_POINT: BorzoAddressPoint = {
  address: 'Dspace Logistics Hub, 10th Main Rd, New Thippasandra, HAL 3rd Stage, Bengaluru, Karnataka 560075',
  contact_person: {
    name: 'Dspace Dispatch Lab',
    phone: '+91 80 4123 9081',
  },
  comment: 'ESD-safe electronics package. Handle with care. Verify item barcode at pickup counter.',
  latitude: 12.9726,
  longitude: 77.6521,
};

const BORZO_API_URL = process.env.BORZO_API_URL || 'https://robotapi-in.borzodelivery.com/api/business/1.8';
const BORZO_AUTH_TOKEN = process.env.BORZO_AUTH_TOKEN;

/**
 * Calculates delivery quote using Borzo Business API.
 * Falls back to distance-based calculation if API token is not yet configured.
 */
export async function calculateBorzoDeliveryQuote({
  destinationAddress,
  customerName,
  customerPhone,
  subtotalInRupees,
}: {
  destinationAddress: string;
  customerName: string;
  customerPhone: string;
  subtotalInRupees: number;
}): Promise<{
  success: boolean;
  fee: number;
  etaMinutes: number;
  serviceName: string;
  isLiveQuote: boolean;
}> {
  // If free delivery threshold met (Profitable basket margin defense)
  if (subtotalInRupees >= 1499) {
    return {
      success: true,
      fee: 0,
      etaMinutes: 35,
      serviceName: 'Borzo Hyper-Local Express (Free on ₹1,499+)',
      isLiveQuote: false,
    };
  }

  // Attempt live Borzo Business API call
  if (BORZO_AUTH_TOKEN) {
    try {
      const response = await fetch(`${BORZO_API_URL}/calculate-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-DV-Auth-Token': BORZO_AUTH_TOKEN,
        },
        body: JSON.stringify({
          type: 'standard',
          matter: 'Electronic Development Boards & Semiconductors',
          vehicle_type_id: 7, // 2-wheeler bike
          points: [
            DSPACE_WAREHOUSE_BORZO_POINT,
            {
              address: destinationAddress,
              contact_person: {
                name: customerName,
                phone: customerPhone,
              },
            },
          ],
        }),
      });

      const data: BorzoCalculationResponse = await response.json();
      if (data.is_successful && data.order) {
        const fee = Math.round(Number(data.order.payment_amount || data.order.delivery_fee_amount));
        return {
          success: true,
          fee: Math.max(49, fee),
          etaMinutes: 35,
          serviceName: 'Borzo 2-Wheeler Courier',
          isLiveQuote: true,
        };
      }
    } catch (err) {
      console.warn('[Borzo API] Live rate calculation failed, falling back to tiered quote:', err);
    }
  }

  // Fallback calculation based on standard Bengaluru 2-wheeler rates
  return {
    success: true,
    fee: 55,
    etaMinutes: 40,
    serviceName: 'Borzo Hyper-Local 2-Wheeler',
    isLiveQuote: false,
  };
}

/**
 * Creates a live delivery order in Borzo's dispatch network.
 */
export async function createBorzoDeliveryOrder({
  orderNumber,
  destinationAddress,
  customerName,
  customerPhone,
  packageDescription,
  declaredValueInRupees,
}: {
  orderNumber: string;
  destinationAddress: string;
  customerName: string;
  customerPhone: string;
  packageDescription: string;
  declaredValueInRupees: number;
}): Promise<{
  success: boolean;
  borzoOrderId?: string;
  trackingUrl?: string;
  assignedRider?: { name: string; phone: string };
  error?: string;
}> {
  if (!BORZO_AUTH_TOKEN) {
    // Simulated Borzo order for testing/sandbox
    const fakeId = `BRZ-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      borzoOrderId: fakeId,
      trackingUrl: `https://borzodelivery.com/in/track/${fakeId}`,
      assignedRider: {
        name: 'Arun Kumar (Borzo)',
        phone: '+91 98450 11923',
      },
    };
  }

  try {
    const payload: BorzoOrderPayload = {
      matter: packageDescription || 'Dspace Electronic Microcontrollers',
      vehicle_type_id: 7, // Motorbike
      insurance_amount: declaredValueInRupees,
      is_client_notification_enabled: true,
      points: [
        {
          ...DSPACE_WAREHOUSE_BORZO_POINT,
          client_order_id: `${orderNumber}-PICKUP`,
        },
        {
          address: destinationAddress,
          client_order_id: `${orderNumber}-DROP`,
          contact_person: {
            name: customerName,
            phone: customerPhone,
          },
          comment: `Dspace Order #${orderNumber}. Fragile static-sensitive electronic hardware.`,
        },
      ],
    };

    const res = await fetch(`${BORZO_API_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DV-Auth-Token': BORZO_AUTH_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const data: BorzoCreateOrderResponse = await res.json();
    if (data.is_successful && data.order) {
      return {
        success: true,
        borzoOrderId: String(data.order.order_id),
        trackingUrl: data.order.tracking_url || `https://borzodelivery.com/in/track/${data.order.order_id}`,
        assignedRider: data.order.courier,
      };
    }

    return {
      success: false,
      error: data.errors?.join(', ') || 'Borzo order creation failed',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error contacting Borzo API',
    };
  }
}

export function generateBorzoTrackingId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `BRZ-BLR-${randomNum}`;
}

export function getRandomBorzoRider() {
  const riders = [
    {
      name: 'Arun Kumar (Borzo)',
      phone: '+91 98450 11923',
      vehicleType: 'Bajaj Pulsar 150 (Borzo 2-Wheeler)',
      vehicleNumber: 'KA-03-JK-7821',
      rating: 4.9,
      totalDeliveries: 1840,
    },
    {
      name: 'Sunil Gowda (Borzo)',
      phone: '+91 99014 55210',
      vehicleType: 'Hero Splendor Plus (Borzo 2-Wheeler)',
      vehicleNumber: 'KA-05-MN-3419',
      rating: 4.8,
      totalDeliveries: 2190,
    },
    {
      name: 'Praveen R. (Borzo)',
      phone: '+91 97312 88412',
      vehicleType: 'Ola S1 Pro Electric (Borzo Eco)',
      vehicleNumber: 'KA-01-EQ-9102',
      rating: 5.0,
      totalDeliveries: 940,
    },
  ];
  return riders[Math.floor(Math.random() * riders.length)];
}

export function isBorzoService(service?: string): boolean {
  return service === 'borzo_2wheeler' || (typeof service === 'string' && service.toLowerCase().includes('borzo'));
}


