import { Role, ProductCategory, ProductStatus, OrderStatus } from "@/types/db";

// ================================
// Re-export DB enums
// ================================
export { Role, ProductCategory, ProductStatus, OrderStatus };

// ================================
// API Response wrapper
// ================================
export type ApiResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ================================
// Product types
// ================================
export interface ProductWithVendor {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: ProductCategory;
  thumbnail: string | null;
  fileUrl: string | null;
  previewUrl: string | null;
  status: ProductStatus;
  views: number;
  createdAt: Date;
  vendorId: string;
  vendor: {
    id: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    verified: boolean;
  };
  _count?: {
    orders: number;
    reviews: number;
  };
  reviews?: Array<{ rating: number }>;
}

// ================================
// Order types
// ================================
export interface OrderWithDetails {
  id: string;
  amount: number;
  platformFee: number;
  vendorEarning: number;
  status: OrderStatus;
  createdAt: Date;
  product: {
    id: string;
    title: string;
    thumbnail: string | null;
    slug: string;
  };
  buyer: {
    id: string;
    name: string | null;
    email: string;
  };
}

// ================================
// Vendor analytics
// ================================
export interface VendorAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalViews: number;
  balance: number;
  products: Array<{
    id: string;
    title: string;
    views: number;
    orders: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

// ================================
// Admin analytics
// ================================
export interface AdminAnalytics {
  totalRevenue: number;
  totalPlatformFees: number;
  totalVendors: number;
  totalBuyers: number;
  activeProducts: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
}

// ================================
// Message types
// ================================
export interface MessageWithSender {
  id: string;
  content: string;
  createdAt: Date;
  read: boolean;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ThreadWithParticipants {
  id: string;
  createdAt: Date;
  buyer: {
    id: string;
    name: string | null;
    image: string | null;
  };
  vendor: {
    id: string;
    name: string | null;
    image: string | null;
  };
  messages: MessageWithSender[];
}

// ================================
// Pagination
// ================================
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ================================
// Navbar + Sidebar
// ================================
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}
