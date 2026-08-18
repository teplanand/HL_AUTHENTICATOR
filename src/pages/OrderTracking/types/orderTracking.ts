/**
 * Order Tracking Module Type Definitions
 * Comprehensive types for all order-related entities
 */

// ============ ENUMS ============
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum OrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ShipmentMode {
  GROUND = 'ground',
  AIR = 'air',
  SEA = 'sea',
  EXPRESS = 'express',
}

/**
 * Order Core Types
 */
export interface Order {
  id: string | number;
  order_number: string;
  customer_id: string | number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  
  // Order Details
  status: OrderStatus;
  priority: OrderPriority;
  order_date: string;
  required_delivery_date: string;
  actual_delivery_date?: string;
  
  // Shipping Details
  shipping_address: Address;
  billing_address?: Address;
  shipment_mode: ShipmentMode;
  carrier?: string;
  tracking_number?: string;
  
  // Items
  items: OrderItem[];
  
  // Financial
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total_amount: number;
  
  // Metadata
  notes?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface OrderItem {
  id: string | number;
  product_id: string | number;
  product_name: string;
  sku: string;
  product_image?: string;
  
  quantity: number;
  unit_price: number;
  total_price: number;
  
  status?: string;
  tracking_id?: string;
}

export interface Address {
  street_line_1: string;
  street_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Order Tracking Related Types
 */
export interface OrderTracking {
  id: string | number;
  order_id: string | number;
  current_status: OrderStatus;
  current_location: {
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  estimated_delivery: string;
  last_updated: string;
  tracking_updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  id: string | number;
  timestamp: string;
  status: OrderStatus;
  location: Address;
  description: string;
  carrier_info?: string;
  proof_of_delivery?: {
    signature?: string;
    photo?: string;
    name?: string;
  };
}

/**
 * API Request/Response Types
 */
export interface CreateOrderRequest {
  customer_id: string | number;
  items: OrderItemRequest[];
  shipping_address: Address;
  billing_address?: Address;
  shipment_mode: ShipmentMode;
  priority?: OrderPriority;
  notes?: string;
  special_instructions?: string;
}

export interface OrderItemRequest {
  product_id: string | number;
  quantity: number;
  unit_price: number;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  priority?: OrderPriority;
  shipping_address?: Address;
  billing_address?: Address;
  notes?: string;
  special_instructions?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  location?: Address;
  description?: string;
  proof_of_delivery?: {
    signature?: string;
    photo?: string;
    name?: string;
  };
}

/**
 * List/Query Types
 */
export interface OrderListQuery {
  skip?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus | OrderStatus[];
  priority?: OrderPriority;
  customer_id?: string | number;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'order_date' | 'required_delivery_date' | 'total_amount';
  sort_order?: 'asc' | 'desc';
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Analytics & Reports
 */
export interface OrderAnalytics {
  total_orders: number;
  total_value: number;
  avg_order_value: number;
  by_status: StatusCount[];
  by_priority: PriorityCount[];
  delivery_performance: {
    on_time: number;
    late: number;
    cancelled: number;
  };
  top_customers: TopCustomer[];
  revenue_trend: RevenueTrendData[];
}

export interface StatusCount {
  status: OrderStatus;
  count: number;
  percentage: number;
}

export interface PriorityCount {
  priority: OrderPriority;
  count: number;
}

export interface TopCustomer {
  customer_id: string | number;
  customer_name: string;
  order_count: number;
  total_value: number;
}

export interface RevenueTrendData {
  date: string;
  revenue: number;
  order_count: number;
}

/**
 * Dashboard Summary
 */
export interface OrderDashboardSummary {
  total_orders_today: number;
  pending_orders: number;
  orders_in_transit: number;
  delivered_today: number;
  cancelled_orders: number;
  avg_delivery_time_days: number;
  total_revenue: number;
  top_shipment_modes: {
    mode: ShipmentMode;
    count: number;
  }[];
}

/**
 * Export/Import Types
 */
export interface ExportOrdersRequest {
  format: 'csv' | 'excel' | 'pdf';
  filters?: OrderListQuery;
  columns?: string[];
}

export interface ImportOrdersRequest {
  file: File;
  mapping: Record<string, string>; // Column mapping
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export type OrderApiResponse = ApiResponse<Order>;
export type OrderListApiResponse = ApiResponse<OrderListResponse>;
export type OrderAnalyticsResponse = ApiResponse<OrderAnalytics>;
