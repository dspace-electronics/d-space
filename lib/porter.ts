import { BLRZone, PorterRider, OrderStatus, DeliveryMilestone } from './types';

const BANGALORE_RIDERS: PorterRider[] = [
  {
    name: 'Ramesh Gowda',
    phone: '+91 99801 44520',
    vehicleType: 'TVS Jupiter 125 (2-Wheeler)',
    vehicleNumber: 'KA-05-EV-4192',
    rating: 4.9,
    totalDeliveries: 3412,
    currentLat: 12.9279,
    currentLng: 77.6271,
    batteryPercent: 84,
  },
  {
    name: 'Manjunath V.',
    phone: '+91 98802 67104',
    vehicleType: 'Honda Activa 6G (2-Wheeler)',
    vehicleNumber: 'KA-01-HG-8821',
    rating: 4.8,
    totalDeliveries: 2840,
    currentLat: 12.9344,
    currentLng: 77.6101,
    batteryPercent: 78,
  },
  {
    name: 'Syed Irfan',
    phone: '+91 97412 89312',
    vehicleType: 'Ather 450X Gen 3 (Electric)',
    vehicleNumber: 'KA-04-ER-9014',
    rating: 5.0,
    totalDeliveries: 1950,
    currentLat: 12.9716,
    currentLng: 77.5946,
    batteryPercent: 91,
  },
];

/**
 * Calculates delivery quote using Porter's actual Bangalore 2-Wheeler pricing model:
 * Standard 2-Wheeler is the cheapest delivery service for electronic parcels in Bangalore.
 */
export function calculatePorterDelivery(zone: BLRZone, isExpress: boolean = false) {
  const baseFee = isExpress ? zone.expressDispatchFee : zone.porterBikeFee;
  const etaMinutes = isExpress ? Math.max(18, zone.deliveryEtaMinutes - 10) : zone.deliveryEtaMinutes;
  
  return {
    serviceName: isExpress ? 'Porter Priority Express' : 'Porter 2-Wheeler (Cheapest)',
    fee: baseFee,
    etaMinutes,
    vehicleType: isExpress ? 'Dedicated Electric Bike' : 'Standard 2-Wheeler Bike',
    hubDistanceKm: zone.hubDistanceKm,
    freeDeliveryEligible: false,
  };
}

export function generatePorterTrackingId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `PTR-BLR-${randomNum}`;
}

export function getRandomPorterRider(): PorterRider {
  const idx = Math.floor(Math.random() * BANGALORE_RIDERS.length);
  return { ...BANGALORE_RIDERS[idx] };
}

export interface TrackingStep {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export function getMilestonesForStatus(status: OrderStatus, _createdAtStr?: string): DeliveryMilestone[] {
  const statuses: OrderStatus[] = ['placed', 'packed', 'driver_assigned', 'in_transit', 'delivered'];
  const currentIndex = statuses.indexOf(status);

  const baseTitles: Record<OrderStatus, { title: string; desc: string }> = {
    placed: {
      title: 'Order Confirmed & Payment Verified',
      desc: 'Parts allocated at Dspace New Thippasandra Central Warehouse.',
    },
    packed: {
      title: 'Anti-Static ESD Shield Packing',
      desc: 'Components sealed in ESD shielding pouches with barcode labeling.',
    },
    driver_assigned: {
      title: 'Porter 2-Wheeler Partner Assigned',
      desc: 'Driver notified and en route to HSR Hub for pickup.',
    },
    in_transit: {
      title: 'Out for Delivery (Live Porter Route)',
      desc: 'Driver en route to your tech hub / lab destination.',
    },
    delivered: {
      title: 'Delivered Safely to Lab',
      desc: 'Package handed over with OTP verification.',
    },
  };

  return statuses.map((stepStatus, idx) => ({
    status: stepStatus,
    title: baseTitles[stepStatus].title,
    description: baseTitles[stepStatus].desc,
    time: idx <= currentIndex ? (idx === 0 ? 'Just now' : `${(currentIndex - idx + 1) * 8}m ago`) : 'Upcoming',
    completed: idx <= currentIndex,
    isCurrent: idx === currentIndex,
  }));
}
