import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import DeleteRequestsPage from './pages/DeleteRequestsPage';
import UsersPage from './pages/UsersPage';
import { ReportsPage, CategoriesPage, ActivityPage, SettingsPage } from './pages/OtherPages';
import Sidebar from './components/Sidebar';

function AppShell() {
  const { currentUser, loading } = useAuth();
  const { deleteRequests } = useShop();
  const [activePage, setActivePage] = useState('dashboard');

  const pendingDeleteCount = useMemo(() =>
    deleteRequests.filter(r => r.status === 'pending').length,
    [deleteRequests]
  );

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner} />
        <p style={{ color: '#64748b', marginTop: '16px' }}>Loading ShopManager Pro...</p>
      </div>
    );
  }

  if (!currentUser) return <LoginPage />;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'products': return <ProductsPage />;
      case 'delete-requests': return <DeleteRequestsPage />;
      case 'users': return <UsersPage />;
      case 'reports': return <ReportsPage />;
      case 'categories': return <CategoriesPage />;
      case 'activity': return <ActivityPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div style={styles.appLayout}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        deleteRequestCount={pendingDeleteCount}
      />
      <main style={styles.main}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

function InnerApp() {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <AppShellNoShop />;
  }
  return (
    <ShopProvider>
      <AppShell />
    </ShopProvider>
  );
}

function AppShellNoShop() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner} />
        <p style={{ color: '#64748b', marginTop: '16px' }}>Loading...</p>
      </div>
    );
  }
  return <LoginPage />;
}

const styles = {
  loading: {
    minHeight: '100vh',
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  loadingSpinner: {
    width: '40px', height: '40px',
    border: '3px solid rgba(99,102,241,0.2)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  appLayout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f172a',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    minHeight: '100vh',
  },
};
