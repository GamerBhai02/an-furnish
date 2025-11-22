export interface Product {
  id: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  materials: string[];
  dimensions: { w: number; d: number; h: number };
  image: string;
  priceRange: string;
  tags: string[];
  published: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export enum FlowType {
  PREDEFINED = 'predefined',
  CUSTOM = 'custom'
}

export enum OrderStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUOTED = 'Quoted',
  PRODUCTION = 'Production',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface ContactDetails {
  name: string;
  phone: string;
  email?: string;
  city: string;
  address?: string;
}

export interface DesignRequest {
  id: string; // Internal ID
  orderId: string; // Human readable AN-YYYY-XXXX
  flowType: FlowType;
  productId?: string; // If predefined
  productName?: string;
  category: string;
  specifications: Record<string, any>; // Flexible for wizard answers
  contact: ContactDetails;
  budget: string;
  timeline?: string;
  status: OrderStatus;
  createdAt: string; // ISO date
  updatedAt: string;
  notes: string[]; // Admin notes
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
