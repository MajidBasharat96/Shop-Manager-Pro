import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ShopContext = createContext(null);

const STORAGE_KEYS = {
  PRODUCTS: 'smp_products',
  CATEGORIES: 'smp_categories',
  DELETE_REQUESTS: 'smp_delete_requests',
  SCANNER_CODES: 'smp_scanner_codes',
};

const SEED_CATEGORIES = [
  { id: 'cat_1', name: 'Electronics', color: '#6366f1', icon: '📱' },
  { id: 'cat_2', name: 'Clothing', color: '#ec4899', icon: '👕' },
  { id: 'cat_3', name: 'Food & Beverages', color: '#f59e0b', icon: '🍎' },
  { id: 'cat_4', name: 'Home & Garden', color: '#10b981', icon: '🏠' },
  { id: 'cat_5', name: 'Sports', color: '#3b82f6', icon: '⚽' },
  { id: 'cat_6', name: 'Books', color: '#8b5cf6', icon: '📚' },
];

const SEED_PRODUCTS = [
  { id: 'prod_1', name: 'Wireless Headphones', sku: 'ELEC-001', categoryId: 'cat_1', price: 79.99, cost: 45.00, stock: 45, minStock: 10, description: 'Premium noise-cancelling wireless headphones', supplier: 'TechSupplies Co.', createdAt: new Date('2024-01-10').toISOString(), updatedAt: new Date('2024-01-10').toISOString(), active: true },
  { id: 'prod_2', name: 'Smart Watch', sku: 'ELEC-002', categoryId: 'cat_1', price: 199.99, cost: 120.00, stock: 23, minStock: 5, description: 'Feature-rich smartwatch with health tracking', supplier: 'TechSupplies Co.', createdAt: new Date('2024-01-12').toISOString(), updatedAt: new Date('2024-01-12').toISOString(), active: true },
  { id: 'prod_3', name: 'Men\'s T-Shirt', sku: 'CLTH-001', categoryId: 'cat_2', price: 24.99, cost: 10.00, stock: 120, minStock: 20, description: '100% cotton casual t-shirt', supplier: 'Fashion House Ltd.', createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date('2024-01-15').toISOString(), active: true },
  { id: 'prod_4', name: 'Organic Coffee Beans', sku: 'FOOD-001', categoryId: 'cat_3', price: 14.99, cost: 7.00, stock: 8, minStock: 15, description: 'Premium single-origin organic coffee', supplier: 'FreshFarm Imports', createdAt: new Date('2024-01-20').toISOString(), updatedAt: new Date('2024-01-20').toISOString(), active: true },
  { id: 'prod_5', name: 'Yoga Mat', sku: 'SPRT-001', categoryId: 'cat_5', price: 39.99, cost: 18.00, stock: 34, minStock: 8, description: 'Non-slip premium yoga mat, 6mm thick', supplier: 'SportGear Pro', createdAt: new Date('2024-02-01').toISOString(), updatedAt: new Date('2024-02-01').toISOString(), active: true },
  { id: 'prod_6', name: 'Python Programming Book', sku: 'BOOK-001', categoryId: 'cat_6', price: 44.99, cost: 20.00, stock: 18, minStock: 5, description: 'Comprehensive Python for beginners', supplier: 'BookWorld Dist.', createdAt: new Date('2024-02-05').toISOString(), updatedAt: new Date('2024-02-05').toISOString(), active: true },
  { id: 'prod_7', name: 'LED Desk Lamp', sku: 'HOME-001', categoryId: 'cat_4', price: 34.99, cost: 16.00, stock: 0, minStock: 5, description: 'Adjustable LED desk lamp with USB port', supplier: 'HomeComfort Ltd.', createdAt: new Date('2024-02-08').toISOString(), updatedAt: new Date('2024-02-08').toISOString(), active: true },
  { id: 'prod_8', name: 'Running Shoes', sku: 'SPRT-002', categoryId: 'cat_5', price: 89.99, cost: 45.00, stock: 56, minStock: 10, description: 'Lightweight performance running shoes', supplier: 'SportGear Pro', createdAt: new Date('2024-02-10').toISOString(), updatedAt: new Date('2024-02-10').toISOString(), active: true },
];

function getData(key, seed) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function ShopProvider({ children }) {
  const { currentUser, logActivity } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deleteRequests, setDeleteRequests] = useState([]);
  const [scannerCodes, setScannerCodes] = useState({});

  useEffect(() => {
    setProducts(getData(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS));
    setCategories(getData(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES));
    setDeleteRequests(getData(STORAGE_KEYS.DELETE_REQUESTS, []));
    setScannerCodes(getData(STORAGE_KEYS.SCANNER_CODES, {}));
  }, []);

  // Products CRUD
  const addProduct = useCallback((productData) => {
    const existing = getData(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    const skuExists = existing.find(p => p.sku.toLowerCase() === productData.sku.toLowerCase());
    if (skuExists) return { success: false, error: 'SKU already exists' };

    const newProduct = {
      id: 'prod_' + Date.now(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };
    const updated = [...existing, newProduct];
    saveData(STORAGE_KEYS.PRODUCTS, updated);
    setProducts(updated);
    logActivity('PRODUCT_CREATED', { productId: newProduct.id, name: newProduct.name, sku: newProduct.sku });
    return { success: true, product: newProduct };
  }, [logActivity]);

  const updateProduct = useCallback((productId, updates) => {
    const existing = getData(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    const idx = existing.findIndex(p => p.id === productId);
    if (idx === -1) return { success: false, error: 'Product not found' };

    const updated = [...existing];
    updated[idx] = { ...updated[idx], ...updates, updatedAt: new Date().toISOString() };
    saveData(STORAGE_KEYS.PRODUCTS, updated);
    setProducts(updated);
    logActivity('PRODUCT_UPDATED', { productId, name: updated[idx].name, fields: Object.keys(updates) });
    return { success: true };
  }, [logActivity]);

  const deleteProduct = useCallback((productId) => {
    const existing = getData(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    const product = existing.find(p => p.id === productId);
    const updated = existing.filter(p => p.id !== productId);
    saveData(STORAGE_KEYS.PRODUCTS, updated);
    setProducts(updated);
    logActivity('PRODUCT_DELETED', { productId, name: product?.name });

    // Clean up delete requests
    const reqs = getData(STORAGE_KEYS.DELETE_REQUESTS, []);
    const updatedReqs = reqs.filter(r => r.productId !== productId);
    saveData(STORAGE_KEYS.DELETE_REQUESTS, updatedReqs);
    setDeleteRequests(updatedReqs);

    return { success: true };
  }, [logActivity]);

  // Delete Request workflow (Employee → Supervisor)
  const requestDelete = useCallback((productId, reason) => {
    const reqs = getData(STORAGE_KEYS.DELETE_REQUESTS, []);
    const existing = reqs.find(r => r.productId === productId && r.status === 'pending');
    if (existing) return { success: false, error: 'A delete request already exists for this product' };

    const products = getData(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    const product = products.find(p => p.id === productId);

    // Generate a unique scanner code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const request = {
      id: 'req_' + Date.now(),
      productId,
      productName: product?.name,
      productSku: product?.sku,
      requestedBy: currentUser?.id,
      requestedByName: currentUser?.name,
      reason,
      status: 'pending', // pending | approved | rejected | scanned
      scannerCode: code,
      createdAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
    };

    const updated = [...reqs, request];
    saveData(STORAGE_KEYS.DELETE_REQUESTS, updated);
    setDeleteRequests(updated);

    // Save scanner code mapping
    const codes = getData(STORAGE_KEYS.SCANNER_CODES, {});
    codes[code] = request.id;
    saveData(STORAGE_KEYS.SCANNER_CODES, codes);
    setScannerCodes(codes);

    logActivity('DELETE_REQUESTED', { productId, productName: product?.name, reason, code });
    return { success: true, request, code };
  }, [currentUser, logActivity]);

  const reviewDeleteRequest = useCallback((requestId, action, reviewNote = '') => {
    const reqs = getData(STORAGE_KEYS.DELETE_REQUESTS, []);
    const idx = reqs.findIndex(r => r.id === requestId);
    if (idx === -1) return { success: false, error: 'Request not found' };

    const updated = [...reqs];
    updated[idx] = {
      ...updated[idx],
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: currentUser?.id,
      reviewedByName: currentUser?.name,
      reviewNote,
      reviewedAt: new Date().toISOString(),
    };
    saveData(STORAGE_KEYS.DELETE_REQUESTS, updated);
    setDeleteRequests(updated);
    logActivity('DELETE_REVIEWED', { requestId, action, productName: updated[idx].productName });
    return { success: true };
  }, [currentUser, logActivity]);

  const scanAndDelete = useCallback((code) => {
    const codes = getData(STORAGE_KEYS.SCANNER_CODES, {});
    const requestId = codes[code];
    if (!requestId) return { success: false, error: 'Invalid scanner code' };

    const reqs = getData(STORAGE_KEYS.DELETE_REQUESTS, []);
    const request = reqs.find(r => r.id === requestId);
    if (!request) return { success: false, error: 'Request not found' };
    if (request.status !== 'approved') return { success: false, error: 'Request not approved by supervisor' };

    // Mark as scanned
    const idx = reqs.findIndex(r => r.id === requestId);
    const updatedReqs = [...reqs];
    updatedReqs[idx] = { ...updatedReqs[idx], status: 'scanned', scannedAt: new Date().toISOString() };
    saveData(STORAGE_KEYS.DELETE_REQUESTS, updatedReqs);
    setDeleteRequests(updatedReqs);

    // Delete the product
    deleteProduct(request.productId);

    // Remove scanner code
    const updatedCodes = { ...codes };
    delete updatedCodes[code];
    saveData(STORAGE_KEYS.SCANNER_CODES, updatedCodes);
    setScannerCodes(updatedCodes);

    logActivity('PRODUCT_SCAN_DELETED', { code, productId: request.productId, productName: request.productName });
    return { success: true, productName: request.productName };
  }, [deleteProduct, logActivity]);

  // Categories CRUD
  const addCategory = useCallback((catData) => {
    const existing = getData(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
    const newCat = { id: 'cat_' + Date.now(), ...catData };
    const updated = [...existing, newCat];
    saveData(STORAGE_KEYS.CATEGORIES, updated);
    setCategories(updated);
    logActivity('CATEGORY_CREATED', { name: catData.name });
    return { success: true, category: newCat };
  }, [logActivity]);

  const updateCategory = useCallback((catId, updates) => {
    const existing = getData(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
    const updated = existing.map(c => c.id === catId ? { ...c, ...updates } : c);
    saveData(STORAGE_KEYS.CATEGORIES, updated);
    setCategories(updated);
    return { success: true };
  }, []);

  const deleteCategory = useCallback((catId) => {
    const existing = getData(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
    const updated = existing.filter(c => c.id !== catId);
    saveData(STORAGE_KEYS.CATEGORIES, updated);
    setCategories(updated);
    logActivity('CATEGORY_DELETED', { catId });
    return { success: true };
  }, [logActivity]);

  // Stats
  const getStats = useCallback(() => {
    const prods = getData(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    const totalValue = prods.reduce((s, p) => s + (p.price * p.stock), 0);
    const totalCost = prods.reduce((s, p) => s + (p.cost * p.stock), 0);
    const lowStock = prods.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStock = prods.filter(p => p.stock === 0).length;
    return {
      totalProducts: prods.length,
      totalValue,
      totalCost,
      profit: totalValue - totalCost,
      lowStock,
      outOfStock,
      activeProducts: prods.filter(p => p.active).length,
    };
  }, []);

  return (
    <ShopContext.Provider value={{
      products, categories, deleteRequests, scannerCodes,
      addProduct, updateProduct, deleteProduct,
      requestDelete, reviewDeleteRequest, scanAndDelete,
      addCategory, updateCategory, deleteCategory,
      getStats,
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}
