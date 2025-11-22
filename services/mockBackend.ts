import { DesignRequest, OrderStatus, Product, FlowType, Category } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../constants';

const STORAGE_KEYS = {
  PRODUCTS: 'an_furnish_products',
  ORDERS: 'an_furnish_orders',
  CATEGORIES: 'an_furnish_categories',
};

// Initialize Mock Data if empty
if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
}

if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
}

// --- PRODUCTS ---
export const getProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const createProduct = (productData: Omit<Product, 'id'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    id: crypto.randomUUID(),
    ...productData
  };
  products.push(newProduct);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return newProduct;
};

export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
};

// --- CATEGORIES (DB Implementation) ---
export const getCategories = (): Category[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return data ? JSON.parse(data) : [];
};

export const createCategory = (categoryData: Omit<Category, 'id'>): Category => {
  const categories = getCategories();
  const newCategory: Category = {
    id: crypto.randomUUID(),
    ...categoryData
  };
  
  categories.push(newCategory);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  return newCategory;
};

export const deleteCategory = (id: string): void => {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
};

// --- ORDERS ---
export const createDesignRequest = (data: Partial<DesignRequest>): DesignRequest => {
  const ordersStr = localStorage.getItem(STORAGE_KEYS.ORDERS);
  const orders: DesignRequest[] = ordersStr ? JSON.parse(ordersStr) : [];

  const now = new Date();
  const year = now.getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `AN-${year}-${randomSuffix}`;

  const newOrder: DesignRequest = {
    id: crypto.randomUUID(),
    orderId,
    status: OrderStatus.NEW,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    notes: [],
    flowType: data.flowType || FlowType.CUSTOM,
    category: data.category || 'Custom',
    specifications: data.specifications || {},
    contact: data.contact!,
    budget: data.budget || 'Not specified',
    timeline: data.timeline,
    productId: data.productId,
    productName: data.productName
  };

  orders.unshift(newOrder); // Add to top
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  
  // Simulate network delay
  return newOrder;
};

export const getDesignRequests = (): DesignRequest[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
};

export const getOrderByReadableId = (orderId: string): DesignRequest | undefined => {
  const orders = getDesignRequests();
  return orders.find(o => o.orderId === orderId);
};

export const updateOrderStatus = (id: string, status: OrderStatus, note?: string): DesignRequest | null => {
  const orders = getDesignRequests();
  const index = orders.findIndex(o => o.id === id);
  
  if (index === -1) return null;

  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  if (note) {
    orders[index].notes.push(`${new Date().toLocaleString()}: ${note}`);
  }

  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  return orders[index];
};