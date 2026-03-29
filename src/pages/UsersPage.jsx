import React, { useState } from 'react';
import { useAuth, ROLES, ROLE_HIERARCHY } from '../context/AuthContext';
import { Plus, Edit2, Trash2, UserCheck, UserX, X, Shield, AlertTriangle } from 'lucide-react';

const ROLE_CONFIG = {
  owner: { color: '#f59e0b', label: 'Owner', icon: '👑' },
  admin: { color: '#6366f1', label: 'Administrator', icon: '⚡' },
  supervisor: { color: '#10b981', label: 'Supervisor', icon: '🎯' },
  employee: { color: '#3b82f6', label: 'Employee', icon: '👤' },
};

const EMPTY = { name: '', email: '', password: '', role: ROLES.EMPLOYEE };

export default function UsersPage() {
  const { currentUser, users, hasPermission, canManageUser, addUser, updateUser, deleteUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const canAdd = hasPermission('ADD_USER');
  const canDelete = hasPermission('DELETE_USER');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!editTarget && (!form.password || form.password.length < 6)) e.password = 'Min 6 characters';
    if (!form.role) e.role = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setForm(EMPTY); setErrors({}); setEditTarget(null); setShowModal(true); };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setErrors({}); setEditTarget(u); setShowModal(true);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editTarget) {
      const updates = { name: form.name, email: form.email, role: form.role };
      if (form.password) updates.password = form.password;
      const res = updateUser(editTarget.id, updates);
      if (res.success) { setShowModal(false); showToast('User updated!'); }
    } else {
      const res = addUser(form);
      if (res.success) { setShowModal(false); showToast('User created!'); }
      else setErrors({ email: res.error });
    }
  };

  const handleToggleActive = (u) => {
    updateUser(u.id, { active: !u.active });
    showToast(u.active ? 'User deactivated' : 'User activated', 'info');
  };

  const handleDelete = () => {
    deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    showToast('User deleted.', 'info');
  };

  // Which roles can current user assign
  const assignableRoles = Object.keys(ROLES).filter(r => {
    const role = ROLES[r];
    return ROLE_HIERARCHY[currentUser?.role] > ROLE_HIERARCHY[role];
  });

  const displayUsers = users.filter(u => u.id !== currentUser?.id);

  return (
    <div style={styles.page}>
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === 'success' ? '#10b981' : toast.type === 'info' ? '#6366f1' : '#ef4444' }}>
          {toast.msg}
        </div>
      )}

      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>User Management</h2>
          <p style={styles.pageSub}>{users.filter(u => u.active).length} active members</p>
        </div>
        {canAdd && (
          <button style={styles.primaryBtn} onClick={openAdd}>
            <Plus size={16} /> Add User
          </button>
        )}
      </div>

      {/* Users table */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Joined</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Current user first */}
            <CurrentUserRow user={currentUser} />
            {displayUsers.map(u => {
              const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.employee;
              const canManage = canManageUser(u);
              return (
                <tr key={u.id} style={{ ...styles.tr, opacity: u.active ? 1 : 0.5 }}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={{ ...styles.avatar, background: rc.color + '33', color: rc.color }}>
                        {u.avatar}
                      </div>
                      <div>
                        <div style={styles.userName}>{u.name}</div>
                        <div style={styles.userEmail}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.roleBadge, background: rc.color + '18', color: rc.color }}>
                      {rc.icon} {rc.label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.date}>{new Date(u.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, background: u.active ? '#10b98118' : '#ef444418', color: u.active ? '#10b981' : '#ef4444' }}>
                      {u.active ? <UserCheck size={12} /> : <UserX size={12} />}
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    {canManage && (
                      <div style={styles.actions}>
                        <button style={styles.iconBtn} onClick={() => openEdit(u)} title="Edit">
                          <Edit2 size={14} color="#94a3b8" />
                        </button>
                        <button
                          style={styles.iconBtn}
                          onClick={() => handleToggleActive(u)}
                          title={u.active ? 'Deactivate' : 'Activate'}
                        >
                          {u.active ? <UserX size={14} color="#f59e0b" /> : <UserCheck size={14} color="#10b981" />}
                        </button>
                        {canDelete && (
                          <button style={styles.iconBtn} onClick={() => setDeleteTarget(u)} title="Delete">
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        )}
                      </div>
                    )}
                    {!canManage && (
                      <span style={styles.noAccess}>
                        <Shield size={12} color="#334155" /> Protected
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role permissions matrix */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Role Permissions Matrix</h3>
        <div style={styles.matrix}>
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
            <div key={role} style={styles.roleCard}>
              <div style={styles.roleHeader}>
                <span style={{ fontSize: '20px' }}>{cfg.icon}</span>
                <span style={{ ...styles.roleLabel, color: cfg.color }}>{cfg.label}</span>
              </div>
              <ul style={styles.permList}>
                {role === ROLES.OWNER && <><li style={styles.permItem}>✓ Full system access</li><li style={styles.permItem}>✓ Manage all users</li><li style={styles.permItem}>✓ Delete any user</li><li style={styles.permItem}>✓ System settings</li><li style={styles.permItem}>✓ Export reports</li></>}
                {role === ROLES.ADMIN && <><li style={styles.permItem}>✓ Manage products & categories</li><li style={styles.permItem}>✓ Add/edit users</li><li style={styles.permItem}>✓ View all reports</li><li style={styles.permItem}>✓ Approve delete requests</li><li style={styles.permItem}>✗ Cannot delete users</li></>}
                {role === ROLES.SUPERVISOR && <><li style={styles.permItem}>✓ Add/edit products</li><li style={styles.permItem}>✓ Approve delete requests</li><li style={styles.permItem}>✓ Use scanner to delete</li><li style={styles.permItem}>✓ View reports & users</li><li style={styles.permItem}>✗ Cannot manage categories</li></>}
                {role === ROLES.EMPLOYEE && <><li style={styles.permItem}>✓ View all products</li><li style={styles.permItem}>✓ Submit delete requests</li><li style={styles.permItem}>✗ Cannot edit products</li><li style={styles.permItem}>✗ Cannot delete directly</li><li style={styles.permItem}>✗ No access to reports</li></>}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editTarget ? 'Edit User' : 'Add New User'}</h3>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}><X size={18} color="#64748b" /></button>
            </div>
            <div style={styles.modalBody}>
              {[
                { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'John Smith' },
                { label: 'Email *', key: 'email', type: 'email', placeholder: 'john@company.com' },
                { label: editTarget ? 'New Password (leave blank to keep)' : 'Password *', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.key} style={styles.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input style={styles.input} type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  {errors[f.key] && <span style={styles.err}>{errors[f.key]}</span>}
                </div>
              ))}

              <div style={styles.field}>
                <label style={styles.label}>Role *</label>
                <select style={{ ...styles.input, cursor: 'pointer' }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {assignableRoles.length > 0 ? assignableRoles.map(r => {
                    const role = ROLES[r];
                    const cfg = ROLE_CONFIG[role];
                    return <option key={role} value={role}>{cfg.icon} {cfg.label}</option>;
                  }) : Object.values(ROLES).filter(r => r !== ROLES.OWNER).map(role => {
                    const cfg = ROLE_CONFIG[role];
                    return <option key={role} value={role}>{cfg.icon} {cfg.label}</option>;
                  })}
                </select>
                {errors.role && <span style={styles.err}>{errors.role}</span>}
              </div>

              <div style={styles.modalFooter}>
                <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={styles.primaryBtn} onClick={handleSubmit}>
                  {editTarget ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete User</h3>
              <button style={styles.closeBtn} onClick={() => setDeleteTarget(null)}><X size={18} color="#64748b" /></button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={styles.deleteIcon}><Trash2 size={28} color="#ef4444" /></div>
                <p style={{ color: '#e2e8f0', fontWeight: '600' }}>Delete "{deleteTarget.name}"?</p>
                <p style={{ color: '#64748b', fontSize: '14px' }}>This will permanently remove the user account.</p>
              </div>
              <div style={styles.modalFooter}>
                <button style={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button style={{ ...styles.primaryBtn, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} onClick={handleDelete}>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CurrentUserRow({ user }) {
  const rc = ROLE_CONFIG[user?.role] || ROLE_CONFIG.employee;
  return (
    <tr style={{ ...styles.tr, background: 'rgba(99,102,241,0.04)' }}>
      <td style={styles.td}>
        <div style={styles.userCell}>
          <div style={{ ...styles.avatar, background: rc.color + '33', color: rc.color }}>{user?.avatar}</div>
          <div>
            <div style={styles.userName}>{user?.name} <span style={{ color: '#6366f1', fontSize: '11px', fontWeight: '600' }}>(You)</span></div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}><span style={{ ...styles.roleBadge, background: rc.color + '18', color: rc.color }}>{rc.icon} {rc.label}</span></td>
      <td style={styles.td}><span style={styles.date}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span></td>
      <td style={styles.td}><span style={{ ...styles.statusBadge, background: '#10b98118', color: '#10b981' }}><UserCheck size={12} /> Active</span></td>
      <td style={{ ...styles.td, textAlign: 'right' }}><span style={styles.noAccess}><Shield size={12} color="#334155" /> You</span></td>
    </tr>
  );
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  pageTitle: { color: '#f8fafc', fontSize: '24px', fontWeight: '700', margin: 0 },
  pageSub: { color: '#64748b', fontSize: '14px', margin: '4px 0 0' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  card: { background: '#1e293b', border: '1px solid rgba(148,163,184,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '20px', overflowX: 'auto' },
  cardTitle: { color: '#e2e8f0', fontSize: '15px', fontWeight: '600', margin: '0 0 20px' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
  th: { color: '#475569', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '8px 12px', borderBottom: '1px solid rgba(148,163,184,0.08)', textAlign: 'left' },
  tr: { borderBottom: '1px solid rgba(148,163,184,0.05)' },
  td: { padding: '12px 12px', verticalAlign: 'middle' },
  userCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', flexShrink: 0 },
  userName: { color: '#e2e8f0', fontSize: '14px', fontWeight: '500' },
  userEmail: { color: '#64748b', fontSize: '12px', marginTop: '1px' },
  roleBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' },
  date: { color: '#64748b', fontSize: '13px' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' },
  actions: { display: 'flex', gap: '4px', justifyContent: 'flex-end' },
  iconBtn: { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', cursor: 'pointer' },
  noAccess: { display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#334155', fontSize: '12px' },
  matrix: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  roleCard: { background: 'rgba(15,23,42,0.4)', borderRadius: '12px', padding: '16px' },
  roleHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  roleLabel: { fontSize: '13px', fontWeight: '700' },
  permList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' },
  permItem: { color: '#64748b', fontSize: '12px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '20px', width: '100%', maxWidth: '440px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(148,163,184,0.08)' },
  modalTitle: { color: '#f8fafc', fontSize: '18px', fontWeight: '600', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
  modalBody: { padding: '24px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' },
  label: { color: '#94a3b8', fontSize: '12px', fontWeight: '500' },
  input: { padding: '10px 12px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', color: '#f8fafc', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  err: { color: '#ef4444', fontSize: '11px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid rgba(148,163,184,0.08)', paddingTop: '20px' },
  cancelBtn: { padding: '10px 18px', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '10px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' },
  deleteIcon: { width: '64px', height: '64px', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  toast: { position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: '500', zIndex: 2000, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
};
