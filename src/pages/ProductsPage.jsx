import React, { useState, useMemo } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import {
  Plus, Search, Filter, Edit2, Trash2, Package,
  AlertTriangle, CheckCircle, X, QrCode, ChevronDown, BarChart2
} from 'lucide-react';

function Modal({ title, onClose, children, accent = '#6366f1' }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ ...styles.modalHeader, borderBottom: `2px solid ${accent}22` }}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} color="#64748b" /></button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={styles.field}>
      {label && <label style={styles.label}>{label}</label>}
      <input style={styles.input} {...props} />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div style={styles.field}>
      {label && <label style={styles.label}>{label}</label>}
      <textarea style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={styles.field}>
      {label && <label style={styles.label}>{label}</label>}
      <select style={{ ...styles.input, cursor: 'pointer' }} {...props}>{children}</select>
    </div>
  );
}

const EMPTY_FORM = { name: '', sku: '', categoryId: '', price: '', cost: '', stock: '', minStock: '', description: '', supplier: '' };

export default function ProductsPage() {
  const { currentUser, hasPermission } = useAuth();
  const { products, categories, addProduct, updateProduct, deleteProduct, requestDelete } = useShop();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [requestTarget, setRequestTarget] = useState(null);
  const [requestReason, setRequestReason] = useState('');
  const [requestCode, setRequestCode] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const isEmployee = currentUser?.role === ROLES.EMPLOYEE;
  const canEdit = hasPermission('EDIT_PRODUCT');
  const canAdd = hasPermission('ADD_PRODUCT');
  const canDelete = hasPermission('DELETE_PRODUCT');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.supplier?.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'all' || p.categoryId === catFilter;
      const matchStock = stockFilter === 'all' || (stockFilter === 'out' && p.stock === 0) || (stockFilter === 'low' && p.stock > 0 && p.stock <= p.minStock) || (stockFilter === 'ok' && p.stock > p.minStock);
      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, catFilter, stockFilter]);

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setEditProduct(null); setShowModal(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, categoryId: p.categoryId, price: p.price, cost: p.cost, stock: p.stock, minStock: p.minStock, description: p.description || '', supplier: p.supplier || '' });
    setErrors({}); setEditProduct(p); setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.sku.trim()) e.sku = 'Required';
    if (!form.categoryId) e.categoryId = 'Required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    if (form.cost && (isNaN(form.cost) || Number(form.cost) < 0)) e.cost = 'Invalid cost';
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Valid stock required';
    if (!form.minStock || isNaN(form.minStock) || Number(form.minStock) < 0) e.minStock = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = { ...form, price: Number(form.price), cost: Number(form.cost || 0), stock: Number(form.stock), minStock: Number(form.minStock) };
    if (editProduct) {
      const res = updateProduct(editProduct.id, data);
      if (res.success) { setShowModal(false); showToast('Product updated!'); }
    } else {
      const res = addProduct(data);
      if (res.success) { setShowModal(false); showToast('Product added!'); }
      else setErrors({ sku: res.error });
    }
  };

  const handleDelete = () => {
    deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
    showToast('Product deleted.', 'info');
  };

  const handleRequestDelete = () => {
    if (!requestReason.trim()) return;
    const res = requestDelete(requestTarget.id, requestReason);
    if (res.success) {
      setRequestCode(res.code);
      setRequestReason('');
    }
  };

  const cat = (id) => categories.find(c => c.id === id);

  return (
    <div style={styles.page}>
      {/* Toast */}
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === 'success' ? '#10b981' : toast.type === 'info' ? '#6366f1' : '#ef4444' }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Products</h2>
          <p style={styles.pageSub}>{filtered.length} of {products.length} products</p>
        </div>
        {canAdd && (
          <button style={styles.primaryBtn} onClick={openAdd}>
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.searchWrap}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={styles.searchInput}
            placeholder="Search by name, SKU, supplier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={styles.filterSelect} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select style={styles.filterSelect} value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
          <option value="all">All Stock</option>
          <option value="ok">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <Package size={48} color="#334155" />
          <p style={{ color: '#64748b', marginTop: '12px' }}>No products found</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(p => {
            const category = cat(p.categoryId);
            const isLow = p.stock > 0 && p.stock <= p.minStock;
            const isOut = p.stock === 0;
            const stockColor = isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';

            return (
              <div key={p.id} style={styles.productCard}>
                <div style={styles.cardTop}>
                  <div style={styles.categoryTag}>
                    {category ? (
                      <span style={{ ...styles.catBadge, background: category.color + '22', color: category.color }}>
                        {category.icon} {category.name}
                      </span>
                    ) : <span style={styles.catBadge}>Uncategorized</span>}
                  </div>
                  <span style={{ ...styles.stockPill, background: stockColor + '18', color: stockColor }}>
                    {isOut ? 'Out' : isLow ? `Low: ${p.stock}` : p.stock}
                  </span>
                </div>

                <h3 style={styles.productName}>{p.name}</h3>
                <div style={styles.skuRow}>
                  <span style={styles.sku}>SKU: {p.sku}</span>
                  {p.supplier && <span style={styles.supplier}>{p.supplier}</span>}
                </div>
                {p.description && <p style={styles.desc}>{p.description}</p>}

                <div style={styles.priceRow}>
                  <span style={styles.price}>${p.price.toFixed(2)}</span>
                  {hasPermission('VIEW_REPORTS') && p.cost > 0 && (
                    <span style={styles.margin}>
                      Margin: {(((p.price - p.cost) / p.price) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                <div style={styles.cardActions}>
                  {canEdit && (
                    <button style={styles.actionBtn} onClick={() => openEdit(p)}>
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                  {isEmployee ? (
                    <button
                      style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                      onClick={() => { setRequestTarget(p); setRequestCode(null); setRequestReason(''); }}
                    >
                      <QrCode size={14} /> Request Delete
                    </button>
                  ) : canDelete ? (
                    <button
                      style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                      onClick={() => setDeleteTarget(p)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editProduct ? 'Edit Product' : 'Add New Product'}
          onClose={() => setShowModal(false)}
        >
          <div style={styles.formGrid}>
            <Input label="Product Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Headphones" />
            {errors.name && <span style={styles.err}>{errors.name}</span>}

            <Input label="SKU *" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. ELEC-001" />
            {errors.sku && <span style={styles.err}>{errors.sku}</span>}

            <Select label="Category *" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </Select>
            {errors.categoryId && <span style={styles.err}>{errors.categoryId}</span>}

            <div style={styles.twoCol}>
              <div>
                <Input label="Price ($) *" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                {errors.price && <span style={styles.err}>{errors.price}</span>}
              </div>
              <div>
                <Input label="Cost ($)" type="number" min="0" step="0.01" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="0.00" />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div>
                <Input label="Stock *" type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                {errors.stock && <span style={styles.err}>{errors.stock}</span>}
              </div>
              <div>
                <Input label="Min Stock *" type="number" min="0" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} placeholder="5" />
                {errors.minStock && <span style={styles.err}>{errors.minStock}</span>}
              </div>
            </div>

            <Input label="Supplier" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
            <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." />
          </div>

          <div style={styles.modalFooter}>
            <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            <button style={styles.primaryBtn} onClick={handleSubmit}>
              {editProduct ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm (for non-employees) */}
      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)} accent="#ef4444">
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={styles.deleteIcon}><Trash2 size={28} color="#ef4444" /></div>
            <p style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: '600' }}>Delete "{deleteTarget.name}"?</p>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
              This action cannot be undone. The product and all associated data will be permanently removed.
            </p>
          </div>
          <div style={styles.modalFooter}>
            <button style={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button style={{ ...styles.primaryBtn, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} onClick={handleDelete}>
              Yes, Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Employee Delete Request Modal */}
      {requestTarget && (
        <Modal title="Request Product Deletion" onClose={() => { setRequestTarget(null); setRequestCode(null); }} accent="#f59e0b">
          {!requestCode ? (
            <>
              <div style={styles.requestInfo}>
                <QrCode size={32} color="#f59e0b" />
                <div>
                  <p style={{ color: '#e2e8f0', fontWeight: '600', margin: 0 }}>"{requestTarget.name}"</p>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                    As an employee, you need supervisor approval to delete products. Submit a reason and a scanner code will be generated for your supervisor.
                  </p>
                </div>
              </div>
              <Textarea
                label="Reason for deletion *"
                value={requestReason}
                onChange={e => setRequestReason(e.target.value)}
                placeholder="Why should this product be deleted? (e.g. discontinued, damaged stock...)"
              />
              <div style={styles.modalFooter}>
                <button style={styles.cancelBtn} onClick={() => setRequestTarget(null)}>Cancel</button>
                <button
                  style={{ ...styles.primaryBtn, background: 'linear-gradient(135deg, #f59e0b, #d97706)', opacity: !requestReason.trim() ? 0.5 : 1 }}
                  onClick={handleRequestDelete}
                  disabled={!requestReason.trim()}
                >
                  Submit Request
                </button>
              </div>
            </>
          ) : (
            <div style={styles.codeBox}>
              <CheckCircle size={32} color="#10b981" />
              <p style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '16px', margin: '12px 0 4px' }}>Request Submitted!</p>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                Show this scanner code to your supervisor. Once they approve and scan it, the product will be deleted.
              </p>
              <div style={styles.scanCode}>{requestCode}</div>
              <p style={{ color: '#475569', fontSize: '12px', marginTop: '8px' }}>Keep this code until your supervisor scans it</p>
              <button style={{ ...styles.primaryBtn, marginTop: '16px' }} onClick={() => { setRequestTarget(null); setRequestCode(null); }}>
                Done
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', maxWidth: '1400px', margin: '0 auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  pageTitle: { color: '#f8fafc', fontSize: '24px', fontWeight: '700', margin: 0, letterSpacing: '-0.3px' },
  pageSub: { color: '#64748b', fontSize: '14px', margin: '4px 0 0' },
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '10px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: '10px', color: '#fff',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
  },
  filters: { display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' },
  searchWrap: { position: 'relative', flex: '1', minWidth: '200px' },
  searchInput: {
    width: '100%', padding: '10px 12px 10px 38px',
    background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: '10px', color: '#f8fafc', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  },
  filterSelect: {
    padding: '10px 14px', background: '#1e293b',
    border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: '10px', color: '#94a3b8', fontSize: '14px',
    cursor: 'pointer', outline: 'none',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' },
  productCard: {
    background: '#1e293b', border: '1px solid rgba(148,163,184,0.08)',
    borderRadius: '16px', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '8px',
    transition: 'border-color 0.2s',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' },
  categoryTag: {},
  stockPill: { padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
  productName: { color: '#f8fafc', fontSize: '15px', fontWeight: '600', margin: 0, lineHeight: '1.3' },
  skuRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sku: { color: '#475569', fontSize: '11px', fontFamily: 'monospace' },
  supplier: { color: '#475569', fontSize: '11px', fontStyle: 'italic' },
  desc: { color: '#64748b', fontSize: '12px', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  priceRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' },
  price: { color: '#f8fafc', fontSize: '18px', fontWeight: '700' },
  margin: { color: '#10b981', fontSize: '12px', fontWeight: '600' },
  cardActions: { display: 'flex', gap: '8px', marginTop: '8px' },
  actionBtn: {
    flex: 1, padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
    background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: '8px', color: '#94a3b8', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
  },
  deleteBtn: { color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' },
  modalTitle: { color: '#f8fafc', fontSize: '18px', fontWeight: '600', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
  modalBody: { padding: '0 24px 24px' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { color: '#94a3b8', fontSize: '12px', fontWeight: '500' },
  input: {
    padding: '10px 12px', background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px',
    color: '#f8fafc', fontSize: '14px', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  },
  err: { color: '#ef4444', fontSize: '11px', marginTop: '-8px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid rgba(148,163,184,0.08)', paddingTop: '20px' },
  cancelBtn: {
    padding: '10px 18px', background: 'rgba(148,163,184,0.08)',
    border: '1px solid rgba(148,163,184,0.15)', borderRadius: '10px',
    color: '#94a3b8', fontSize: '14px', cursor: 'pointer',
  },
  deleteIcon: { width: '64px', height: '64px', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  requestInfo: { display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', background: 'rgba(245,158,11,0.08)', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(245,158,11,0.2)' },
  codeBox: { textAlign: 'center', padding: '8px 0' },
  scanCode: {
    fontFamily: 'monospace', fontSize: '36px', fontWeight: '800',
    color: '#f59e0b', letterSpacing: '8px',
    background: 'rgba(245,158,11,0.1)', padding: '16px 24px',
    borderRadius: '12px', border: '2px dashed rgba(245,158,11,0.4)',
    display: 'inline-block', margin: '0 auto',
  },
  toast: {
    position: 'fixed', bottom: '24px', right: '24px',
    padding: '12px 20px', borderRadius: '12px',
    color: '#fff', fontSize: '14px', fontWeight: '500',
    display: 'flex', alignItems: 'center', gap: '8px',
    zIndex: 2000, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
};
