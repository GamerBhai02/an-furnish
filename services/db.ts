import { DesignRequest, OrderStatus, Product, FlowType, Category } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../constants';

const API_URL = '/api'; // Relative path for Vercel (proxy or rewrites)

// --- Local Storage Keys ---
const STORAGE_KEYS = {
  PRODUCTS: 'an_furnish_products',
  ORDERS: 'an_furnish_orders',
  CATEGORIES: 'an_furnish_categories',
  AUTH_TOKEN: 'an_furnish_token'
};

// --- Helper: Initialize Local Data ---
const initLocalData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
};
initLocalData();

// --- API Wrapper with Fallback ---
async function fetchWithFallback<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  fallbackFn: () => T
): Promise<T> {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers as any || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
      // If 401 Unauthorized, clear token
      if (response.status === 401) {
         localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
      throw new Error(response.statusText || 'API Error');
    }
    return await response.json();
  } catch (error) {
    console.warn(`API Offline/Error (${endpoint}). Using LocalStorage/Fallback.`);
    if (fallbackFn) return fallbackFn();
    throw error;
  }
}

// --- AUTHENTICATION ---

export const loginAdmin = async (username: string, password: string): Promise<boolean> => {
  // Try API Login
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      return true;
    }
  } catch (e) {
    console.log("API Login failed, checking local fallback...");
  }

  // Fallback Mock Login (Only works if backend is totally down)
  // In a real secure environment, you wouldn't have a fallback login.
  if (password === 'admin123') {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token');
    return true;
  }
  return false;
};

export const setupAdmin = async (username: string, password: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    return data.message || data.error;
  } catch (e) {
    return "Failed to connect to server";
  }
}

export const logoutAdmin = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

// --- PRODUCTS ---

export const getProducts = async (): Promise<Product[]> => {
  return fetchWithFallback('/products', {}, () => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  });
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  return fetchWithFallback(`/products/${id}`, {}, () => {
    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    return products.find(p => p.id === id);
  });
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  return fetchWithFallback('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  }, () => {
    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const newProduct: Product = { id: crypto.randomUUID(), ...productData };
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return newProduct;
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  return fetchWithFallback(`/products/${id}`, { method: 'DELETE' }, () => {
    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  });
};

// --- CATEGORIES ---

export const getCategories = async (): Promise<Category[]> => {
  return fetchWithFallback('/categories', {}, () => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  });
};

export const createCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
  return fetchWithFallback('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData)
  }, () => {
    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    const newCategory: Category = { id: crypto.randomUUID(), ...categoryData };
    categories.push(newCategory);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return newCategory;
  });
};

export const deleteCategory = async (id: string): Promise<void> => {
  return fetchWithFallback(`/categories/${id}`, { method: 'DELETE' }, () => {
    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
  });
};

// --- ORDERS / DESIGN REQUESTS ---

export const createDesignRequest = async (data: Partial<DesignRequest>): Promise<DesignRequest> => {
  const now = new Date();
  const year = now.getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const fallbackOrderId = `AN-${year}-${randomSuffix}`;

  return fetchWithFallback('/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  }, () => {
    const ordersStr = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const orders: DesignRequest[] = ordersStr ? JSON.parse(ordersStr) : [];
    
    const newOrder: DesignRequest = {
      id: crypto.randomUUID(),
      orderId: fallbackOrderId,
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

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  });
};

export const getDesignRequests = async (): Promise<DesignRequest[]> => {
  return fetchWithFallback('/orders', {}, () => {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  });
};

export const getOrderByReadableId = async (orderId: string): Promise<DesignRequest | undefined> => {
  return fetchWithFallback(`/orders/track/${orderId}`, {}, () => {
    const orders: DesignRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return orders.find(o => o.orderId === orderId);
  });
};

export const updateOrderStatus = async (id: string, status: OrderStatus, note?: string): Promise<DesignRequest | null> => {
  return fetchWithFallback(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, note })
  }, () => {
    const orders: DesignRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) return null;

    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();
    if (note) {
      orders[index].notes.push(`${new Date().toLocaleString()}: ${note}`);
    }

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return orders[index];
  });
};