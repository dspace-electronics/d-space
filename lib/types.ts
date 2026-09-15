export type ProductCategory =
  | 'microcontrollers'
  | 'sensors'
  | 'power'
  | 'actuators'
  | 'tools'
  | 'wireless'
  | 'passives';

export type UserRole = 'admin' | 'customer' | 'user';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceModifier: number; // in INR
  stock: number;
}

export interface ProductReview {
  id: string;
  author: string;
  role?: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: ProductCategory;
  categoryName?: string;
  price: number; // in INR
  comparePrice?: number;
  inStock?: boolean;
  stockCount?: number;
  stock?: number; // number for full backward compatibility
  blrHubStock: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  imageUrl?: string;
  description: string;
  editorialBlurb?: string;
  specs: Record<string, string>;
  features: string[];
  variants?: ProductVariant[];
  variantLabel?: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isSameDayEligible?: boolean;
  voltageLogic?: '3.3V' | '5V' | '1.8V' | 'Multi-Voltage';
  pinoutUrl?: string;
  datasheetUrl?: string;
  reviews?: ProductReview[];
}

export interface CartItem {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
}

export interface BLRZone {
  id: string;
  name: string;
  area: string;
  pincode: string;
  hubDistanceKm: number;
  deliveryEtaMinutes: number;
  porterBikeFee: number;
  expressDispatchFee: number;
  popularTechHub: string;
}

export type OrderStatus = 'placed' | 'packed' | 'driver_assigned' | 'in_transit' | 'delivered';

export interface OrderRider {
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  currentLat?: number;
  currentLng?: number;
  batteryPercent?: number;
}

export type PorterRider = OrderRider;

export interface OrderMilestone {
  status: OrderStatus;
  title: string;
  description: string;
  time: string;
  completed: boolean;
  isCurrent?: boolean;
}

export type DeliveryMilestone = OrderMilestone;

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  shippingMethod: 'porter_2wheeler' | 'porter_express' | 'standard_courier' | string;
  courierService?: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  blrZone: BLRZone;
  paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'cod' | string;
  paymentStatus: 'paid' | 'pending';
  paymentId?: string;
  porterTrackingId?: string;
  porterRider?: OrderRider;
  estimatedDeliveryTime?: string;
  deliveryMilestones?: OrderMilestone[];
}

export interface UserAddress {
  id: string;
  label: 'Lab' | 'Office' | 'Home' | 'Workshop';
  fullName: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer' | 'user';
  company?: string;
  gstNumber?: string;
  defaultAddress?: string;
  defaultZoneId?: string;
  memberSince?: string;
  tier?: 'Maker' | 'Pro Lab' | 'Enterprise' | string;
}
