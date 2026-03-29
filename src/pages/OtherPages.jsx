import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { BarChart2, TrendingUp, Package, DollarSign, AlertTriangle, Download, Tag, Plus, Edit2, Trash2, X, Activity, Settings, Save, CheckCircle } from 'lucide-react';

// ========== REPORTS PAGE ==========
export function ReportsPage() {
  const { products, categories, getStats } = useShop();
  const { hasPermission } = useAuth();
  const stats = useMemo(() => getStats(), [getStats, products]);
  const canExport = hasPermission('EXPORT_REPORTS');

  const topProducts = [...products].sort((a, b) => (b.price * b.stock) - (a.price * a.stock)).slice(0, 8);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock);

  const catStats = useMemo(() => {
    return categories.map(cat => {
      const catProds = products.filter(p => p.categoryId === cat.id);
      return {
        ...cat,
        count: catProds.length,
        totalValue: catProds.reduce((s, p) => s + (p.price * p.stock), 0),
        totalStock: catProds.reduce((s, p) => s + p.stock, 0),
      };
    }).filter(c => c.count > 0).sort((a, b) => b.totalValue - a.totalValue);
  }, [categories, products]);

  const exportCSV = () => {
    const headers = 'Name,SKU,Category,Price,Cost,Stock,Min Stock,Value\n';
    const rows = products.map(p => {
      const cat = categories.find(c => c.id === p.categoryId);
      return `"${p.name}","${p.sku}","${cat?.name || 'N/A'}",${p.price},${p.cost},${p.stock},${p.minStock},${(p.price * p.stock).toFixed(2)}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inventory_report.csv'; a.click();
  };

  return (
    <div style={rStyles.page}>
      <div style={rStyles.pageHeader}>
        <div>
          <h2 style={rStyles.pageTitle}>Reports & Analytics</h2>
          <p style={rStyles.pageSub}>Inventory insights and performance metrics</p>
        </div>
        {canExport && (
          <button style={rStyles.primaryBtn} onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div style={rStyles.kpiGrid}>
        {[
          { label: 'Total Inventory Value', value: `$${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#10b981', icon: DollarSign },
          { label: 'Total Cost Basis', value: `$${stats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#6366f1', icon: TrendingUp },
          { label: 'Gross Margin', value: `$${stats.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#f59e0b', icon: BarChart2 },
          { label: 'Low / Out of Stock', value: `${stats.lowStock} / ${stats.outOfStock}`, color: '#ef4444', icon: AlertTriangle },
        ].map(k => (
          <div key={k.label} style={{ ...rStyles.kpiCard, borderTop: `3px solid ${k.color}` }}>
            <div style={{ ...rStyles.kpiIcon, background: k.color + '18' }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div style={rStyles.kpiValue}>{k.value}</div>
            <div style={rStyles.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={rStyles.grid2}>
        {/* Top products by value */}
        <div style={rStyles.card}>
          <h3 style={rStyles.cardTitle}>Top Products by Inventory Value</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {topProducts.map((p, i) => {
              const val = p.price * p.stock;
              const maxVal = topProducts[0] ? topProducts[0].price * topProducts[0].stock : 1;
              const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div key={p.id} style={rStyles.rankRow}>
                  <span style={rStyles.rank}>#{i + 1}</span>
                  <div style={rStyles.rankInfo}>
                    <div style={rStyles.rankName}>{p.name}</div>
                    <div style={rStyles.rankBar}>
                      <div style={{ ...rStyles.rankFill, width: pct + '%' }} />
                    </div>
                  </div>
                  <span style={rStyles.rankVal}>${val.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div style={rStyles.card}>
          <h3 style={rStyles.cardTitle}>Category Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {catStats.map(c => (
              <div key={c.id} style={rStyles.catRow}>
                <span style={{ fontSize: '18px' }}>{c.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={rStyles.catName}>{c.name}</span>
                    <span style={rStyles.catVal}>${c.totalValue.toFixed(0)}</span>
                  </div>
                  <div style={rStyles.catMeta}>{c.count} products · {c.totalStock} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock alert table */}
      {lowStockProducts.length > 0 && (
        <div style={rStyles.card}>
          <h3 style={{ ...rStyles.cardTitle, color: '#fca5a5' }}>⚠️ Inventory Alerts ({lowStockProducts.length})</h3>
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table style={rStyles.table}>
              <thead>
                <tr>
                  {['Product', 'SKU', 'Stock', 'Min', 'Status', 'Retail Value'].map(h => <th key={h} style={rStyles.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(p => {
                  const isOut = p.stock === 0;
                  return (
                    <tr key={p.id} style={rStyles.tr}>
                      <td style={rStyles.td}><span style={rStyles.prodName}>{p.name}</span></td>
                      <td style={rStyles.td}><span style={rStyles.sku}>{p.sku}</span></td>
                      <td style={rStyles.td}><span style={{ color: isOut ? '#ef4444' : '#f59e0b', fontWeight: '700' }}>{p.stock}</span></td>
                      <td style={rStyles.td}><span style={{ color: '#475569' }}>{p.minStock}</span></td>
                      <td style={rStyles.td}>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: isOut ? '#ef444418' : '#f59e0b18', color: isOut ? '#ef4444' : '#f59e0b' }}>
                          {isOut ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td style={rStyles.td}><span style={{ color: '#94a3b8' }}>${(p.price * p.stock).toFixed(2)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const rStyles = {
  page: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  pageTitle: { color: '#f8fafc', fontSize: '24px', fontWeight: '700', margin: 0 },
  pageSub: { color: '#64748b', fontSize: '14px', margin: '4px 0 0' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' },
  kpiCard: { background: '#1e293b', border: '1px solid rgba(148,163,184,0.08)', borderRadius: '16px', padding: '20px' },
  kpiIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' },
  kpiValue: { color: '#f8fafc', fontSize: '22px', fontWeight: '700' },
  kpiLabel: { color: '#64748b', fontSize: '12px', marginTop: '4px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  card: { background: '#1e293b', border: '1px solid rgba(148,163,184,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '16px' },
  cardTitle: { color: '#e2e8f0', fontSize: '15px', fontWeight: '600', margin: 0 },
  rankRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  rank: { color: '#475569', fontSize: '12px', fontWeight: '700', width: '24px', flexShrink: 0 },
  rankInfo: { flex: 1 },
  rankName: { color: '#94a3b8', fontSize: '13px', marginBottom: '4px' },
  rankBar: { height: '4px', background: 'rgba(148,163,184,0.1)', borderRadius: '2px', overflow: 'hidden' },
  rankFill: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '2px' },
  rankVal: { color: '#e2e8f0', fontSize: '13px', fontWeight: '600', flexShrink: 0 },
  catRow: { display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(148,163,184,0.05)' },
  catName: { color: '#e2e8f0', fontSize: '13px', fontWeight: '500' },
  catVal: { color: '#10b981', fontSize: '13px', fontWeight: '600' },
  catMeta: { color: '#475569', fontSize: '11px', marginTop: '2px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#475569', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '8px 12px', borderBottom: '1px solid rgba(148,163,184,0.08)', textAlign: 'left' },
  tr: { borderBottom: '1px solid rgba(148,163,184,0.05)' },
  td: { padding: '10px 12px' },
  prodName: { color: '#e2e8f0', fontSize: '13px', fontWeight: '500' },
  sku: { color: '#475569', fontSize: '12px', fontFamily: 'monospace' },
};

// ========== CATEGORIES PAGE ==========
export function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useShop();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '📦', color: '#6366f1' });
  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];
  const ICONS = ['📦', '📱', '👕', '🍎', '🏠', '⚽', '📚', '💄', '🎮', '🔧', '🚗', '💊'];

  const openAdd = () => { setForm({ name: '', icon: '📦', color: '#6366f1' }); setEditTarget(null); setShowModal(true); };
  const openEdit = (c) => { setForm({ name: c.name, icon: c.icon, color: c.color }); setEditTarget(c); setShowModal(true); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editTarget) { updateCategory(editTarget.id, form); }
    else { addCategory(form); }
    setShowModal(false);
  };

  return (
    <div style={rStyles.page}>
      <div style={rStyles.pageHeader}>
        <div>
          <h2 style={rStyles.pageTitle}>Categories</h2>
          <p style={rStyles.pageSub}>{categories.length} categories defined</p>
        </div>
        <button style={rStyles.primaryBtn} onClick={openAdd}><Plus size={16} /> Add Category</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {categories.map(c => {
          const count = products.filter(p => p.categoryId === c.id).length;
          return (
            <div key={c.id} style={{ background: '#1e293b', border: `1px solid ${c.color}22`, borderRadius: '16px', padding: '20px', borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{c.icon}</div>
              <div style={{ color: '#f8fafc', fontSize: '15px', fontWeight: '600' }}>{c.name}</div>
              <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{count} product{count !== 1 ? 's' : ''}</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button style={{ flex: 1, padding: '6px', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }} onClick={() => openEdit(c)}>
                  <Edit2 size={12} style={{ marginRight: '4px' }} />Edit
                </button>
                <button style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }} onClick={() => deleteCategory(c.id)} disabled={count > 0} title={count > 0 ? 'Remove products first' : 'Delete'}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '20px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
              <h3 style={{ color: '#f8fafc', margin: 0, fontSize: '18px' }}>{editTarget ? 'Edit' : 'Add'} Category</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowModal(false)}><X size={18} color="#64748b" /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Name *</label>
                <input style={{ padding: '10px 12px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', color: '#f8fafc', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ICONS.map(ic => <button key={ic} style={{ fontSize: '20px', width: '36px', height: '36px', borderRadius: '8px', border: form.icon === ic ? '2px solid #6366f1' : '1px solid rgba(148,163,184,0.1)', background: form.icon === ic ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.4)', cursor: 'pointer' }} onClick={() => setForm({ ...form, icon: ic })}>{ic}</button>)}
                </div>
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {COLORS.map(col => <button key={col} style={{ width: '28px', height: '28px', borderRadius: '50%', background: col, border: form.color === col ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer', outline: 'none' }} onClick={() => setForm({ ...form, color: col })} />)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid rgba(148,163,184,0.08)', paddingTop: '16px' }}>
                <button style={{ padding: '10px 18px', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '10px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }} onClick={handleSubmit}>{editTarget ? 'Save' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== ACTIVITY LOG PAGE ==========
export function ActivityPage() {
  const { activityLog } = useAuth();
  const [search, setSearch] = useState('');

  const ACTION_LABELS = {
    USER_LOGIN: { label: 'Login', color: '#10b981' },
    USER_LOGOUT: { label: 'Logout', color: '#64748b' },
    USER_CREATED: { label: 'User Created', color: '#6366f1' },
    USER_UPDATED: { label: 'User Updated', color: '#f59e0b' },
    USER_DELETED: { label: 'User Deleted', color: '#ef4444' },
    PRODUCT_CREATED: { label: 'Product Added', color: '#10b981' },
    PRODUCT_UPDATED: { label: 'Product Updated', color: '#f59e0b' },
    PRODUCT_DELETED: { label: 'Product Deleted', color: '#ef4444' },
    DELETE_REQUESTED: { label: 'Delete Requested', color: '#f59e0b' },
    DELETE_REVIEWED: { label: 'Request Reviewed', color: '#6366f1' },
    PRODUCT_SCAN_DELETED: { label: 'Scanner Delete', color: '#ef4444' },
    CATEGORY_CREATED: { label: 'Category Added', color: '#10b981' },
    CATEGORY_DELETED: { label: 'Category Removed', color: '#ef4444' },
  };

  const filtered = activityLog.filter(e =>
    !search || e.userName?.toLowerCase().includes(search.toLowerCase()) || e.action?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={rStyles.page}>
      <div style={rStyles.pageHeader}>
        <div>
          <h2 style={rStyles.pageTitle}>Activity Log</h2>
          <p style={rStyles.pageSub}>{activityLog.length} events recorded</p>
        </div>
      </div>
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input style={{ ...rStyles.card, padding: '10px 12px 10px 38px', width: '100%', boxSizing: 'border-box', color: '#f8fafc', fontSize: '14px', outline: 'none', marginBottom: 0 }} placeholder="Search by user or action..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={rStyles.card}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No activity found</div>
        ) : (
          <table style={rStyles.table}>
            <thead>
              <tr>
                {['Time', 'User', 'Role', 'Action', 'Details'].map(h => <th key={h} style={rStyles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(e => {
                const cfg = ACTION_LABELS[e.action] || { label: e.action, color: '#64748b' };
                return (
                  <tr key={e.id} style={rStyles.tr}>
                    <td style={rStyles.td}><span style={{ color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>{new Date(e.timestamp).toLocaleString()}</span></td>
                    <td style={rStyles.td}><span style={{ color: '#e2e8f0', fontSize: '13px' }}>{e.userName || 'System'}</span></td>
                    <td style={rStyles.td}><span style={{ color: '#64748b', fontSize: '12px', textTransform: 'capitalize' }}>{e.userRole || '—'}</span></td>
                    <td style={rStyles.td}><span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: cfg.color + '18', color: cfg.color }}>{cfg.label}</span></td>
                    <td style={rStyles.td}><span style={{ color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>{JSON.stringify(e.details || {}).slice(0, 60)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ========== SETTINGS PAGE ==========
export function SettingsPage() {
  const { currentUser, updateUser } = useAuth();
  const [form, setForm] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', password: '', confirmPassword: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (form.password && form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password && form.password.length < 6) return setError('Password must be at least 6 characters');
    const updates = { name: form.name, email: form.email };
    if (form.password) updates.password = form.password;
    updateUser(currentUser.id, updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={rStyles.page}>
      <h2 style={rStyles.pageTitle}>Settings</h2>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Manage your account and application preferences</p>

      <div style={{ maxWidth: '480px' }}>
        <div style={rStyles.card}>
          <h3 style={rStyles.cardTitle}>Profile Settings</h3>
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'New Password', key: 'password', type: 'password', placeholder: 'Leave blank to keep current' },
            { label: 'Confirm Password', key: 'confirmPassword', type: 'password', placeholder: 'Repeat new password' },
          ].map(f => (
            <div key={f.key} style={{ marginTop: '16px' }}>
              <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '5px' }}>{f.label}</label>
              <input
                type={f.type}
                style={{ padding: '10px 12px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', color: '#f8fafc', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
              />
            </div>
          ))}
          {error && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>{error}</div>}
          <button style={{ ...rStyles.primaryBtn, marginTop: '20px', width: '100%', justifyContent: 'center' }} onClick={handleSave}>
            {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>

        <div style={rStyles.card}>
          <h3 style={rStyles.cardTitle}>System Information</h3>
          {[
            ['Application', 'ShopManager Pro v1.0.0'],
            ['Storage', 'Browser LocalStorage'],
            ['Authentication', 'Session-based with roles'],
            ['Your Role', currentUser?.role?.toUpperCase()],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>{k}</span>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
