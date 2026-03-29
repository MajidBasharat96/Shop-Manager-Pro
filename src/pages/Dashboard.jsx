import React, { useMemo } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import {
  Package, TrendingUp, AlertTriangle, Users,
  DollarSign, ShoppingBag, BarChart2, ArrowUpRight, ClipboardList
} from 'lucide-react';

const ROLE_WELCOME = {
  owner: { label: 'Owner', greeting: 'Full store overview at your fingertips.', color: '#f59e0b' },
  admin: { label: 'Administrator', greeting: 'Manage operations and user access.', color: '#6366f1' },
  supervisor: { label: 'Supervisor', greeting: 'Monitor inventory and approve requests.', color: '#10b981' },
  employee: { label: 'Staff Member', greeting: 'View products and submit requests.', color: '#3b82f6' },
};

function StatCard({ icon: Icon, label, value, sub, accent, trend }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${accent}` }}>
      <div style={styles.statHeader}>
        <div style={{ ...styles.statIconWrap, background: accent + '18' }}>
          <Icon size={20} color={accent} />
        </div>
        {trend && (
          <div style={{ ...styles.trend, color: '#10b981' }}>
            <ArrowUpRight size={14} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={styles.barRow}>
      <div style={styles.barLabel}>{label}</div>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: pct + '%', background: color }} />
      </div>
      <div style={styles.barValue}>{value}</div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { currentUser, users } = useAuth();
  const { products, categories, deleteRequests, getStats } = useShop();

  const stats = useMemo(() => getStats(), [getStats, products]);
  const roleInfo = ROLE_WELCOME[currentUser?.role] || ROLE_WELCOME.employee;

  const pendingRequests = deleteRequests.filter(r => r.status === 'pending');
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.minStock).slice(0, 5);
  const outOfStock = products.filter(p => p.stock === 0).slice(0, 5);
  const recentProducts = [...products].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);

  // Category breakdown
  const catBreakdown = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      count: products.filter(p => p.categoryId === cat.id).length,
    })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
  }, [categories, products]);

  const canSeeFinancials = [ROLES.OWNER, ROLES.ADMIN].includes(currentUser?.role);
  const canSeeUsers = [ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR].includes(currentUser?.role);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.welcome}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span style={{ color: roleInfo.color }}>{currentUser?.name?.split(' ')[0]}</span>
          </div>
          <p style={styles.welcomeSub}>{roleInfo.greeting}</p>
        </div>
        <div style={{ ...styles.rolePill, background: roleInfo.color + '18', color: roleInfo.color }}>
          {roleInfo.label}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts} sub={`${stats.activeProducts} active`} accent="#6366f1" />
        {canSeeFinancials && (
          <StatCard icon={DollarSign} label="Inventory Value" value={`$${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="at retail prices" accent="#10b981" trend="+12%" />
        )}
        <StatCard icon={AlertTriangle} label="Low Stock" value={stats.lowStock} sub={`${stats.outOfStock} out of stock`} accent="#f59e0b" />
        {canSeeUsers && (
          <StatCard icon={Users} label="Team Members" value={users.filter(u => u.active).length} sub={`${categories.length} categories`} accent="#3b82f6" />
        )}
        {pendingRequests.length > 0 && (
          <StatCard icon={ClipboardList} label="Pending Requests" value={pendingRequests.length} sub="awaiting approval" accent="#ef4444" />
        )}
      </div>

      {/* Content Grid */}
      <div style={styles.contentGrid}>
        {/* Recent Products */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recently Updated</h3>
            <button style={styles.cardLink} onClick={() => onNavigate('products')}>View all →</button>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>SKU</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Stock</th>
                  {canSeeFinancials && <th style={{ ...styles.th, textAlign: 'right' }}>Price</th>}
                </tr>
              </thead>
              <tbody>
                {recentProducts.map(p => {
                  const isLow = p.stock > 0 && p.stock <= p.minStock;
                  const isOut = p.stock === 0;
                  return (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.productName}>{p.name}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.sku}>{p.sku}</span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <span style={{
                          ...styles.stockBadge,
                          background: isOut ? '#ef444418' : isLow ? '#f59e0b18' : '#10b98118',
                          color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
                        }}>
                          {p.stock}
                        </span>
                      </td>
                      {canSeeFinancials && (
                        <td style={{ ...styles.td, textAlign: 'right', color: '#94a3b8' }}>
                          ${p.price.toFixed(2)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div style={styles.rightPanel}>
          {/* Category breakdown */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Products by Category</h3>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {catBreakdown.slice(0, 6).map(cat => (
                <MiniBar key={cat.id} label={`${cat.icon} ${cat.name}`} value={cat.count} max={products.length} color={cat.color} />
              ))}
            </div>
          </div>

          {/* Alerts */}
          {(lowStockItems.length > 0 || outOfStock.length > 0) && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⚠️ Inventory Alerts</h3>
              {outOfStock.slice(0, 3).map(p => (
                <div key={p.id} style={{ ...styles.alertRow, borderLeft: '3px solid #ef4444' }}>
                  <div style={styles.alertName}>{p.name}</div>
                  <span style={{ ...styles.alertBadge, background: '#ef444418', color: '#ef4444' }}>Out of stock</span>
                </div>
              ))}
              {lowStockItems.slice(0, 3).map(p => (
                <div key={p.id} style={{ ...styles.alertRow, borderLeft: '3px solid #f59e0b' }}>
                  <div style={styles.alertName}>{p.name}</div>
                  <span style={{ ...styles.alertBadge, background: '#f59e0b18', color: '#f59e0b' }}>{p.stock} left</span>
                </div>
              ))}
            </div>
          )}

          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div style={{ ...styles.card, borderColor: '#ef444430' }}>
              <div style={styles.cardHeader}>
                <h3 style={{ ...styles.cardTitle, color: '#fca5a5' }}>🗑 Delete Requests</h3>
                <button style={styles.cardLink} onClick={() => onNavigate('delete-requests')}>Review →</button>
              </div>
              {pendingRequests.slice(0, 3).map(r => (
                <div key={r.id} style={{ ...styles.alertRow, borderLeft: '3px solid #ef4444' }}>
                  <div>
                    <div style={styles.alertName}>{r.productName}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>by {r.requestedByName}</div>
                  </div>
                  <span style={{ ...styles.alertBadge, background: '#ef444418', color: '#ef4444' }}>Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px', maxWidth: '1400px', margin: '0 auto' },
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  welcome: { color: '#f8fafc', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px' },
  welcomeSub: { color: '#64748b', fontSize: '14px', margin: '4px 0 0' },
  rolePill: { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: {
    background: '#1e293b', border: '1px solid rgba(148,163,184,0.08)',
    borderRadius: '16px', padding: '20px',
  },
  statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  statIconWrap: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  trend: { display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: '600' },
  statValue: { color: '#f8fafc', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' },
  statLabel: { color: '#94a3b8', fontSize: '13px', marginTop: '2px' },
  statSub: { color: '#475569', fontSize: '11px', marginTop: '4px' },
  contentGrid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' },
  card: {
    background: '#1e293b', border: '1px solid rgba(148,163,184,0.08)',
    borderRadius: '16px', padding: '20px', marginBottom: '16px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { color: '#e2e8f0', fontSize: '15px', fontWeight: '600', margin: 0 },
  cardLink: { background: 'none', border: 'none', color: '#818cf8', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
  rightPanel: {},
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#475569', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '8px 12px', borderBottom: '1px solid rgba(148,163,184,0.08)', textAlign: 'left' },
  tr: { borderBottom: '1px solid rgba(148,163,184,0.05)' },
  td: { padding: '10px 12px', color: '#94a3b8', fontSize: '13px' },
  productName: { color: '#e2e8f0', fontWeight: '500' },
  sku: { color: '#475569', fontFamily: 'monospace', fontSize: '12px' },
  stockBadge: { padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  barRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  barLabel: { color: '#94a3b8', fontSize: '12px', width: '140px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  barTrack: { flex: 1, height: '6px', background: 'rgba(148,163,184,0.1)', borderRadius: '3px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },
  barValue: { color: '#64748b', fontSize: '12px', width: '24px', textAlign: 'right' },
  alertRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'rgba(15,23,42,0.4)', marginTop: '8px', gap: '8px' },
  alertName: { color: '#e2e8f0', fontSize: '13px', fontWeight: '500' },
  alertBadge: { padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', flexShrink: 0 },
};
