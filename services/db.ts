import { DesignRequest, OrderStatus, Product, FlowType, Category } from '../types';

const API_URL = '/api'; // Relative path for Vercel (proxy or rewrites)

// --- Local Storage Keys ---
const STORAGE_KEYS = {
  AUTH_TOKEN: 'an_furnish_token'
};

// --- API Wrapper ---
// We removed the aggressive "fallbackFn" for everything.
// We want to force using the API to ensure MongoDB integration is working.
// If API is down, the app should probably show an error rather than fake data
// for a "production-ready" requirement.

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers as any || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
      if (response.status === 401) {
         localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
         throw new Error("Unauthorized: Please log in again.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText || `API Error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Request Failed (${endpoint}):`, error);
    throw error;
  }
}

// --- AUTHENTICATION ---

export const loginAdmin = async (username: string, password: string): Promise<boolean> => {
  try {
    const data = await fetchAPI<{token: string, username: string}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Login failed:", e);
    return false;
  }
};

export const setupAdmin = async (username: string, password: string): Promise<string> => {
  try {
    const data = await fetchAPI<{message: string}>('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    return data.message || "Success";
  } catch (e: any) {
    return e.message || "Failed to connect to server";
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
  try {
    return await fetchAPI<Product[]>('/products');
  } catch (e) {
    console.warn("Using fallback empty list for products due to error");
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    return await fetchAPI<Product>(`/products/${id}`);
  } catch (e) {
    return undefined;
  }
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  return await fetchAPI<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await fetchAPI(`/products/${id}`, { method: 'DELETE' });
};

// --- CATEGORIES ---

export const getCategories = async (): Promise<Category[]> => {
  try {
    return await fetchAPI<Category[]>('/categories');
  } catch (e) {
    console.warn("Using fallback empty list for categories due to error");
    return [];
  }
};

export const createCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
  return await fetchAPI<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData)
  });
};

export const deleteCategory = async (id: string): Promise<void> => {
  await fetchAPI(`/categories/${id}`, { method: 'DELETE' });
};

// --- ORDERS / DESIGN REQUESTS ---

export const createDesignRequest = async (data: Partial<DesignRequest>): Promise<DesignRequest> => {
  return await fetchAPI<DesignRequest>('/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const getDesignRequests = async (): Promise<DesignRequest[]> => {
  return await fetchAPI<DesignRequest[]>('/orders');
};

export const getOrderByReadableId = async (orderId: string): Promise<DesignRequest | undefined> => {
  try {
    return await fetchAPI<DesignRequest>(`/orders/track/${orderId}`);
  } catch (e) {
    return undefined;
  }
};

export const updateOrderStatus = async (id: string, status: OrderStatus, note?: string): Promise<DesignRequest | null> => {
  return await fetchAPI<DesignRequest>(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, note })
  });
};