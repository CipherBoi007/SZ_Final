// ─── User ────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phoneVerified?: boolean;
  role: 'user' | 'admin';
  avatar?: string;
  profileImage?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  refreshToken?: string;
  data: { user: User };
}

// ─── Product Variant ─────────────────────────────
export interface ProductVariant {
  id: string;
  productId: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  color: string;
  price: number;
  stock: number;
  sku?: string;
  createdAt?: string;
}

// ─── Product ─────────────────────────────────────
export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order?: number;
  variantId?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  material?: string;
  rating: number;
  numReviews: number;
  discount: number;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
  categoryId: string;
  Category?: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  reviews?: Review[];
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  type?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  parentId?: string;
  subcategories?: Category[];
}

// ─── Cart ────────────────────────────────────────
export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  userId: string;
  variant: {
    id: string;
    size: string;
    color: string;
    price: number;
    stock: number;
    sku?: string;
    Product: {
      id: string;
      name: string;
      brand?: string;
      images?: ProductImage[];
    };
  };
}

// ─── Order ───────────────────────────────────────
export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
  productSnapshot: {
    name: string;
    size: string;
    color: string;
    brand?: string;
    image?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  orderItems: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: string;
  shippingAddressSnapshot: Address;
  billingAddressSnapshot?: Address;
  phone: string;
  email: string;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  deliveryDateFormatted?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  notes?: string;
  createdAt: string;
}

// ─── Address ─────────────────────────────────────
export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
  instructions?: string;
  latitude?: number;
  longitude?: number;
}

// ─── Coupon ──────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  isPublic?: boolean;
}

// ─── Wishlist ────────────────────────────────────
export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  reminderPrice?: number;
  isReminderActive?: boolean;
  createdAt: string;
  product?: Product;
}

// ─── Review ──────────────────────────────────────
export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase?: boolean;
  User?: { id: string; name: string; avatar?: string };
  createdAt: string;
}

// ─── API Response ────────────────────────────────
export interface ApiResponse<T> {
  status: string;
  data: T;
  results?: number;
  totalPages?: number;
  currentPage?: number;
}

// ─── Helpers ─────────────────────────────────────
/** Get the price range from a product's variants */
export function getProductPriceRange(product: Product): { min: number; max: number } {
  if (!product.variants || product.variants.length === 0) return { min: 0, max: 0 };
  const prices = product.variants.map((v) => Number(v.price));
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Get the total stock across all variants */
export function getProductTotalStock(product: Product): number {
  if (!product.variants || product.variants.length === 0) return 0;
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

/** Get unique sizes from variants */
export function getProductSizes(product: Product): string[] {
  if (!product.variants) return [];
  return [...new Set(product.variants.map((v) => v.size))];
}

/** Get unique colors from variants */
export function getProductColors(product: Product): string[] {
  if (!product.variants) return [];
  return [...new Set(product.variants.map((v) => v.color))];
}

/** Format price range for display */
export function formatPriceRange(product: Product): string {
  const { min, max } = getProductPriceRange(product);
  if (min === max) return `₹${min.toLocaleString()}`;
  return `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`;
}

/** Get discounted price for a variant given product discount % */
export function getDiscountedPrice(price: number, discountPercent: number): number {
  if (!discountPercent || discountPercent <= 0) return price;
  return Math.round(price * (1 - discountPercent / 100));
}
