import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Role hierarchy: owner > admin > supervisor > employee
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  EMPLOYEE: 'employee',
};

export const ROLE_HIERARCHY = {
  owner: 4,
  admin: 3,
  supervisor: 2,
  employee: 1,
};

export const PERMISSIONS = {
  // Products
  VIEW_PRODUCTS: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.EMPLOYEE],
  ADD_PRODUCT: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR],
  EDIT_PRODUCT: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR],
  DELETE_PRODUCT: [ROLES.OWNER, ROLES.ADMIN], // Employee needs supervisor approval
  REQUEST_DELETE: [ROLES.EMPLOYEE],
  APPROVE_DELETE: [ROLES.SUPERVISOR, ROLES.ADMIN, ROLES.OWNER],

  // Users
  VIEW_USERS: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR],
  ADD_USER: [ROLES.OWNER, ROLES.ADMIN],
  EDIT_USER: [ROLES.OWNER, ROLES.ADMIN],
  DELETE_USER: [ROLES.OWNER],
  CHANGE_ROLE: [ROLES.OWNER],

  // Reports
  VIEW_REPORTS: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR],
  EXPORT_REPORTS: [ROLES.OWNER, ROLES.ADMIN],

  // Settings
  MANAGE_SETTINGS: [ROLES.OWNER],
  VIEW_LOGS: [ROLES.OWNER, ROLES.ADMIN],

  // Categories
  MANAGE_CATEGORIES: [ROLES.OWNER, ROLES.ADMIN],
  VIEW_CATEGORIES: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.EMPLOYEE],
};

// Default seed users
const SEED_USERS = [
  {
    id: 'usr_owner_1',
    name: 'Alex Owner',
    email: 'owner@shopmanager.com',
    password: 'owner123',
    role: ROLES.OWNER,
    avatar: 'AO',
    createdAt: new Date('2024-01-01').toISOString(),
    active: true,
  },
  {
    id: 'usr_admin_1',
    name: 'Sam Admin',
    email: 'admin@shopmanager.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    avatar: 'SA',
    createdAt: new Date('2024-01-15').toISOString(),
    active: true,
  },
  {
    id: 'usr_sup_1',
    name: 'Jordan Supervisor',
    email: 'supervisor@shopmanager.com',
    password: 'super123',
    role: ROLES.SUPERVISOR,
    avatar: 'JS',
    createdAt: new Date('2024-02-01').toISOString(),
    active: true,
  },
  {
    id: 'usr_emp_1',
    name: 'Taylor Employee',
    email: 'employee@shopmanager.com',
    password: 'emp123',
    role: ROLES.EMPLOYEE,
    avatar: 'TE',
    createdAt: new Date('2024-02-15').toISOString(),
    active: true,
  },
];

const STORAGE_KEYS = {
  USERS: 'smp_users',
  CURRENT_USER: 'smp_current_user',
  SESSION_TOKEN: 'smp_session_token',
  ACTIVITY_LOG: 'smp_activity_log',
};

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getUsers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  } catch {
    return SEED_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    const storedUsers = getUsers();
    setUsers(storedUsers);

    const token = sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    const storedUser = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const found = storedUsers.find(u => u.id === user.id && u.active);
        if (found) setCurrentUser(found);
      } catch {}
    }

    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG) || '[]');
      setActivityLog(logs);
    } catch {}

    setLoading(false);
  }, []);

  const logActivity = useCallback((action, details = {}) => {
    const entry = {
      id: Date.now().toString(),
      userId: currentUser?.id,
      userName: currentUser?.name,
      userRole: currentUser?.role,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLog(prev => {
      const updated = [entry, ...prev].slice(0, 500);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(updated));
      return updated;
    });
  }, [currentUser]);

  const login = useCallback((email, password) => {
    const allUsers = getUsers();
    const user = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.active
    );
    if (!user) return { success: false, error: 'Invalid email or password' };

    const token = generateToken();
    sessionStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    setCurrentUser(user);
    setUsers(allUsers);

    const entry = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      details: { email: user.email },
      timestamp: new Date().toISOString(),
    };
    setActivityLog(prev => {
      const updated = [entry, ...prev].slice(0, 500);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(updated));
      return updated;
    });

    return { success: true, user };
  }, []);

  const logout = useCallback(() => {
    logActivity('USER_LOGOUT');
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setCurrentUser(null);
  }, [logActivity]);

  const hasPermission = useCallback((permission) => {
    if (!currentUser) return false;
    const allowed = PERMISSIONS[permission];
    return allowed ? allowed.includes(currentUser.role) : false;
  }, [currentUser]);

  const canManageUser = useCallback((targetUser) => {
    if (!currentUser) return false;
    if (currentUser.id === targetUser.id) return false;
    return ROLE_HIERARCHY[currentUser.role] > ROLE_HIERARCHY[targetUser.role];
  }, [currentUser]);

  const addUser = useCallback((userData) => {
    const allUsers = getUsers();
    const exists = allUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) return { success: false, error: 'Email already exists' };

    const newUser = {
      id: 'usr_' + Date.now(),
      ...userData,
      avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      createdAt: new Date().toISOString(),
      active: true,
    };
    const updated = [...allUsers, newUser];
    saveUsers(updated);
    setUsers(updated);
    logActivity('USER_CREATED', { targetUserId: newUser.id, targetName: newUser.name, role: newUser.role });
    return { success: true, user: newUser };
  }, [logActivity]);

  const updateUser = useCallback((userId, updates) => {
    const allUsers = getUsers();
    const idx = allUsers.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found' };

    const updated = [...allUsers];
    updated[idx] = { ...updated[idx], ...updates };
    saveUsers(updated);
    setUsers(updated);

    if (currentUser?.id === userId) {
      setCurrentUser(updated[idx]);
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated[idx]));
    }
    logActivity('USER_UPDATED', { targetUserId: userId, updates: Object.keys(updates) });
    return { success: true };
  }, [currentUser, logActivity]);

  const deleteUser = useCallback((userId) => {
    const allUsers = getUsers();
    const updated = allUsers.filter(u => u.id !== userId);
    saveUsers(updated);
    setUsers(updated);
    logActivity('USER_DELETED', { targetUserId: userId });
    return { success: true };
  }, [logActivity]);

  return (
    <AuthContext.Provider value={{
      currentUser, users, loading, activityLog,
      login, logout, logActivity,
      hasPermission, canManageUser,
      addUser, updateUser, deleteUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
