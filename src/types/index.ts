export type Language = 'ky' | 'ru';

export type ProductCategory =
  | 'rice'
  | 'oil'
  | 'pasta'
  | 'salt'
  | 'sugar'
  | 'flour'
  | 'sauces'
  | 'mayo'
  | 'canned'
  | 'other';

export interface CategoryItem {
  id: ProductCategory;
  name: string;
  name_ky: string;
  name_ru: string;
  description: string;
  description_ky: string;
  description_ru: string;
  image: string;
  itemCount: number;
}

export type UnitType = 'кг' | 'г' | 'л' | 'мл' | 'даана' | 'кап' | 'куту' | 'бөтөлкө';

export interface Product {
  id: string;
  name: string;
  name_ky: string;
  name_ru: string;
  brand: string;
  category: ProductCategory;
  description: string;
  description_ky: string;
  description_ru: string;
  weightOrVolume: string; // e.g. "25 кг", "5 л", "400 г"
  numericWeightOrVolume: number;
  measureUnit: 'кг' | 'г' | 'л' | 'мл';
  packagingUnit: string;
  packagingUnit_ky: string;
  packagingUnit_ru: string;
  itemsPerPackage?: number;
  inStock: boolean;
  stockQuantity: number;
  warehouseLocation?: 'Ош (Центральный)' | 'Баткен (Филиал)' | 'Оба склада';
  warehouseLocation_ky?: string;
  warehouseLocation_ru?: string;
  imageUrl: string;
  isPopular?: boolean;
  isSpecialOffer?: boolean;
  barcode?: string;
  baseWholesalePrice?: number; // Internal hourly wholesale base price in KGS (hidden from customer)
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedUnit: string;
  totalWeightOrVolumeText: string;
  unitPrice?: number; // Base unit price in KGS computed for admin
  totalPrice?: number; // Total line item price in KGS
}

export type DeliveryRegionId = 'osh' | 'batken';

export interface DeliveryRegion {
  id: DeliveryRegionId;
  name: string;
  name_ky: string;
  name_ru: string;
  districts: string[];
  districts_ky: string[];
  districts_ru: string[];
  estimatedTime: string;
  estimatedTime_ky: string;
  estimatedTime_ru: string;
  scheduleDescription: string;
  scheduleDescription_ky: string;
  scheduleDescription_ru: string;
}

export type DeliveryMethod = 'delivery' | 'pickup';

export type PaymentMethod = 'cash' | 'qr_mbank' | 'bank_transfer';

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  region: DeliveryRegionId;
  cityOrVillage: string;
  detailedAddress: string;
  orderNotes?: string;
  preferredDeliveryTime?: string;
  businessName?: string;
}

export type OrderStatus = 'new' | 'processing' | 'in_transit' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: OrderCustomerInfo;
  items: CartItem[];
  totalWeightKg: number;
  totalVolumeLiters: number;
  totalItemsCount: number;
  deliveryMethod: DeliveryMethod;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  assignedDriver?: string;
  // Dynamic Pricing fields for Admin & Customer WhatsApp receipt
  subtotalAmount: number; // Sum of line items in Som
  deliveryFee: number; // Delivery cost in Som
  discountAmount?: number; // Optional discount
  totalAmount: number; // Final payable sum in Som (subtotal + delivery - discount)
  priceConfirmedAt?: string; // Hourly confirmation timestamp
  adminPriceNotes?: string; // Hourly market price rationale notes
  paymentStatus?: 'pending' | 'confirmed' | 'paid';
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  type: 'retail' | 'grocery_store' | 'cafe_restaurant' | 'wholesale_trader';
  phone: string;
  region: DeliveryRegionId;
  cityOrVillage: string;
  ordersCount: number;
  lastOrderDate: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: 'fuel' | 'warehouse_rent' | 'salaries' | 'logistics' | 'packaging' | 'other';
  amount: number;
  date: string;
  notes: string;
}

export interface BusinessSettings {
  companyName: string;
  tagline_ky: string;
  tagline_ru: string;
  whatsappPhone: string;
  displayPhone: string;
  centralWarehouseAddress_ky: string;
  centralWarehouseAddress_ru: string;
  batkenWarehouseAddress_ky: string;
  batkenWarehouseAddress_ru: string;
  operatingHours_ky: string;
  operatingHours_ru: string;
  deliveryTermsNotice_ky: string;
  deliveryTermsNotice_ru: string;
  // legacy backward compat
  centralWarehouseAddress?: string;
  batkenWarehouseAddress?: string;
  operatingHours?: string;
  deliveryTermsNotice?: string;
}
