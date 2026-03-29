import React, { useState } from 'react';
import { useAuth, ROLES, ROLE_HIERARCHY } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Users, BarChart3,
  Settings, LogOut, ShoppingBag, Tag, ClipboardList,
  AlertTriangle, Activity, ChevronRight, Menu, X
} from 'lucide-react';

const ROLE_COLORS = {
  owner: { bg: '#f59e0b22', text: '#f59e0b', dot: '#f59e0b' },
  admin: { bg: '#6366f122', text: '#818cf8', dot: '#6366f1' },
  supervisor: { bg: '#10b98122', text: '#34d399', dot: '#10b981' },
  employee: { bg: '#3b82f622', text: '#60a5fa', dot: '#3b82f6' },
};

const NAV_ITEMS = [
  { path: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.EMPLOYEE] },
  { path: 'products', icon: Package, label: 'Products', roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.EMPLOYEE] },
  { path: 'categories', icon: Tag, label: 'Categories', roles: [ROLES.OWNER, ROLES.ADMIN] },
  { path: 'delete-requests', icon: ClipboardList, label: 'Delete Requests', roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.EMPLOYEE], badge: 'pending' },
  { path: 'users', icon: Users, label: 'User Management', roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR] },
  { path: 'reports', icon: BarChart3, label: 'Reports', roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR] },
  { path: 'activity', icon: Activity, label: 'Activity Logs', roles: [ROLES.OWNER, ROLES.ADMIN] },
  { path: 'settings', icon: Settings, label: 'Settings', roles: [ROLES.OWNER] },
];

export default function Sidebar({ activePage, onNavigate, deleteRequestCount }) {
  const { currentUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleStyle = ROLE_COLORS[currentUser?.role] || ROLE_COLORS.employee;
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser?.role));

  const SidebarContent = () => (
    <div style={{ ...styles.sidebar, width: collapsed ? '72px' : '240px' }}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>
          <ShoppingBag size={20} color="#fff" strokeWidth={1.5} />
        </div>
        {!collapsed && (
          <div style={styles.logoText}>
            <span style={styles.logoName}>ShopManager</span>
            <span style={styles.logoPro}>Pro</span>
          </div>
        )}
        <button
          style={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronRight size={16} color="#64748b" style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {/* User card */}
      <div style={{ ...styles.userCard, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={styles.avatar}>{currentUser?.avatar || '??'}</div>
        {!collapsed && (
          <div style={styles.userInfo}>
            <div style={styles.userName}>{currentUser?.name}</div>
            <div style={{ ...styles.roleBadge, background: roleStyle.bg, color: roleStyle.text }}>
              <span style={{ ...styles.roleDot, background: roleStyle.dot }} />
              {currentUser?.role?.charAt(0).toUpperCase() + currentUser?.role?.slice(1)}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {!collapsed && <div style={styles.navSection}>NAVIGATION</div>}
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.path;
          const showBadge = item.badge === 'pending' && deleteRequestCount > 0;

          return (
            <button
              key={item.path}
              style={{
                ...styles.navItem,
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              onClick={() => { onNavigate(item.path); setMobileOpen(false); }}
              title={collapsed ? item.label : ''}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Icon size={18} color={isActive ? '#818cf8' : '#64748b'} />
                {showBadge && <span style={styles.navBadge}>{deleteRequestCount}</span>}
              </div>
              {!collapsed && (
                <span style={{ ...styles.navLabel, color: isActive ? '#c7d2fe' : '#94a3b8' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={styles.logoutArea}>
        <button
          style={{ ...styles.navItem, justifyContent: collapsed ? 'center' : 'flex-start', borderLeft: '3px solid transparent' }}
          onClick={logout}
          title="Sign Out"
        >
          <LogOut size={18} color="#64748b" />
          {!collapsed && <span style={{ ...styles.navLabel, color: '#94a3b8' }}>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div style={styles.desktopWrap}>
        <SidebarContent />
      </div>

      {/* Mobile toggle */}
      <button
        style={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} color="#f8fafc" /> : <Menu size={20} color="#f8fafc" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div style={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
          <div style={styles.mobileSidebar}>
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}

const styles = {
  desktopWrap: {
    display: 'flex',
    '@media (max-width: 768px)': { display: 'none' },
  },
  sidebar: {
    height: '100vh',
    background: '#0f172a',
    borderRight: '1px solid rgba(148,163,184,0.08)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.25s ease',
    flexShrink: 0,
    overflowX: 'hidden',
    position: 'sticky',
    top: 0,
  },
  logoArea: {
    padding: '20px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid rgba(148,163,184,0.06)',
    minHeight: '70px',
  },
  logoIcon: {
    width: '36px', height: '36px', flexShrink: 0,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
  },
  logoText: { display: 'flex', alignItems: 'baseline', gap: '4px', flex: 1, minWidth: 0 },
  logoName: { color: '#f8fafc', fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap' },
  logoPro: { color: '#818cf8', fontSize: '12px', fontWeight: '600' },
  collapseBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '4px', marginLeft: 'auto', display: 'flex', flexShrink: 0,
  },
  userCard: {
    padding: '16px',
    display: 'flex', alignItems: 'center', gap: '10px',
    borderBottom: '1px solid rgba(148,163,184,0.06)',
  },
  avatar: {
    width: '36px', height: '36px', flexShrink: 0,
    background: 'linear-gradient(135deg, #334155, #475569)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#f8fafc', fontSize: '13px', fontWeight: '600',
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { color: '#e2e8f0', fontSize: '13px', fontWeight: '600', truncate: true, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roleBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '2px 8px', borderRadius: '6px',
    fontSize: '11px', fontWeight: '600', marginTop: '3px',
  },
  roleDot: { width: '5px', height: '5px', borderRadius: '50%' },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' },
  navSection: { color: '#334155', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', padding: '8px 8px 4px', marginTop: '4px' },
  navItem: {
    width: '100%', padding: '9px 10px',
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'none', border: 'none', borderRadius: '8px',
    cursor: 'pointer', transition: 'background 0.15s',
    textAlign: 'left',
  },
  navBadge: {
    position: 'absolute', top: '-5px', right: '-5px',
    background: '#ef4444', color: '#fff',
    width: '16px', height: '16px', borderRadius: '50%',
    fontSize: '10px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  navLabel: { fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' },
  logoutArea: { padding: '8px', borderTop: '1px solid rgba(148,163,184,0.06)' },
  mobileToggle: {
    position: 'fixed', top: '16px', left: '16px',
    zIndex: 1000,
    background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: '10px', padding: '8px',
    cursor: 'pointer', display: 'none',
  },
  mobileOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)', zIndex: 998,
  },
  mobileSidebar: {
    position: 'fixed', top: 0, left: 0, bottom: 0,
    zIndex: 999,
  },
};
