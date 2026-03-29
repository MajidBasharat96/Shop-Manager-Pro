import React, { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { QrCode, Check, X, Clock, CheckCircle, XCircle, Scan, AlertTriangle, Trash2 } from 'lucide-react';

function ScannerModal({ onClose, onScan }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = () => {
    setError('');
    const res = onScan(code.trim().toUpperCase());
    if (res.success) {
      setResult(res.productName);
    } else {
      setError(res.error);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>🔍 Supervisor Scanner</h3>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} color="#64748b" /></button>
        </div>
        <div style={styles.modalBody}>
          {!result ? (
            <>
              <div style={styles.scannerIllustration}>
                <Scan size={48} color="#6366f1" />
                <div style={styles.scanLines}>
                  <div style={{ ...styles.scanLine, animationDelay: '0s' }} />
                  <div style={{ ...styles.scanLine, animationDelay: '0.2s' }} />
                  <div style={{ ...styles.scanLine, animationDelay: '0.4s' }} />
                </div>
              </div>
              <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '14px', marginBottom: '20px' }}>
                Enter the 6-character code shown on the employee's screen to execute the approved deletion.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={styles.codeInputWrap}>
                  <input
                    style={styles.codeInput}
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 6)); setError(''); }}
                    placeholder="XXXXXX"
                    maxLength={6}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && code.length === 6 && handleScan()}
                  />
                </div>
                {error && (
                  <div style={styles.errBox}>
                    <AlertTriangle size={14} color="#ef4444" />
                    {error}
                  </div>
                )}
                <button
                  style={{ ...styles.primaryBtn, opacity: code.length !== 6 ? 0.5 : 1 }}
                  onClick={handleScan}
                  disabled={code.length !== 6}
                >
                  <Scan size={16} /> Execute Delete
                </button>
              </div>
            </>
          ) : (
            <div style={styles.successBox}>
              <CheckCircle size={48} color="#10b981" />
              <h3 style={{ color: '#f8fafc', margin: '16px 0 8px' }}>Deletion Successful</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                "{result}" has been permanently deleted from inventory.
              </p>
              <button style={{ ...styles.primaryBtn, marginTop: '20px', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={onClose}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_CONFIG = {
  pending: { icon: Clock, color: '#f59e0b', label: 'Pending', bg: '#f59e0b18' },
  approved: { icon: CheckCircle, color: '#10b981', label: 'Approved', bg: '#10b98118' },
  rejected: { icon: XCircle, color: '#ef4444', label: 'Rejected', bg: '#ef444418' },
  scanned: { icon: Trash2, color: '#6366f1', label: 'Deleted', bg: '#6366f118' },
};

export default function DeleteRequestsPage() {
  const { currentUser, hasPermission } = useAuth();
  const { deleteRequests, reviewDeleteRequest, scanAndDelete } = useShop();
  const [showScanner, setShowScanner] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [filter, setFilter] = useState('all');

  const isEmployee = currentUser?.role === ROLES.EMPLOYEE;
  const canApprove = hasPermission('APPROVE_DELETE');
  const canScan = [ROLES.SUPERVISOR, ROLES.ADMIN, ROLES.OWNER].includes(currentUser?.role);

  const visible = deleteRequests.filter(r => {
    if (isEmployee) return r.requestedBy === currentUser?.id;
    if (filter === 'all') return true;
    return r.status === filter;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleReview = (action) => {
    reviewDeleteRequest(reviewTarget.id, action, reviewNote);
    setReviewTarget(null);
    setReviewNote('');
  };

  const handleScan = (code) => {
    return scanAndDelete(code);
  };

  const pendingCount = deleteRequests.filter(r => r.status === 'pending').length;

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Delete Requests</h2>
          <p style={styles.pageSub}>
            {isEmployee ? 'Your deletion requests' : `${pendingCount} pending approval`}
          </p>
        </div>
        {canScan && (
          <button style={{ ...styles.primaryBtn, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} onClick={() => setShowScanner(true)}>
            <Scan size={16} /> Open Scanner
          </button>
        )}
      </div>

      {/* Filter tabs (non-employees) */}
      {!isEmployee && (
        <div style={styles.tabs}>
          {['all', 'pending', 'approved', 'rejected', 'scanned'].map(t => (
            <button
              key={t}
              style={{ ...styles.tab, ...(filter === t ? styles.tabActive : {}) }}
              onClick={() => setFilter(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'pending' && pendingCount > 0 && (
                <span style={styles.tabBadge}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Info box for employees */}
      {isEmployee && (
        <div style={styles.infoBox}>
          <QrCode size={20} color="#6366f1" />
          <div>
            <strong style={{ color: '#e2e8f0' }}>How it works:</strong>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}> Submit a deletion request → Get a scanner code → Show it to your supervisor → They scan it to confirm the deletion.</span>
          </div>
        </div>
      )}

      {/* Requests List */}
      {visible.length === 0 ? (
        <div style={styles.empty}>
          <QrCode size={48} color="#334155" />
          <p style={{ color: '#64748b', marginTop: '12px' }}>No requests found</p>
        </div>
      ) : (
        <div style={styles.requestList}>
          {visible.map(r => {
            const status = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            return (
              <div key={r.id} style={styles.requestCard}>
                <div style={styles.requestTop}>
                  <div style={styles.requestLeft}>
                    <h3 style={styles.productName}>{r.productName}</h3>
                    <span style={styles.sku}>SKU: {r.productSku}</span>
                  </div>
                  <span style={{ ...styles.statusBadge, background: status.bg, color: status.color }}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </div>

                <div style={styles.requestMeta}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Requested by</span>
                    <span style={styles.metaValue}>{r.requestedByName}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Submitted</span>
                    <span style={styles.metaValue}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.reviewedByName && (
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Reviewed by</span>
                      <span style={styles.metaValue}>{r.reviewedByName}</span>
                    </div>
                  )}
                </div>

                <div style={styles.reasonBox}>
                  <span style={styles.metaLabel}>Reason: </span>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>{r.reason}</span>
                </div>

                {r.reviewNote && (
                  <div style={{ ...styles.reasonBox, borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}>
                    <span style={styles.metaLabel}>Review note: </span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{r.reviewNote}</span>
                  </div>
                )}

                {/* Scanner code for employee (pending requests) */}
                {isEmployee && r.status === 'pending' && (
                  <div style={styles.codePreview}>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Your code:</span>
                    <span style={styles.inlineCode}>{r.scannerCode}</span>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Show to supervisor</span>
                  </div>
                )}
                {isEmployee && r.status === 'approved' && (
                  <div style={{ ...styles.codePreview, borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Approved! Scan code:</span>
                    <span style={{ ...styles.inlineCode, color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>{r.scannerCode}</span>
                  </div>
                )}

                {/* Approve/Reject buttons for supervisors */}
                {canApprove && r.status === 'pending' && (
                  <div style={styles.actionRow}>
                    <button
                      style={{ ...styles.approveBtn }}
                      onClick={() => { setReviewTarget(r); setReviewNote(''); }}
                    >
                      Review Request
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Review Delete Request</h3>
              <button style={styles.closeBtn} onClick={() => setReviewTarget(null)}><X size={18} color="#64748b" /></button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.reviewInfo}>
                <p style={{ color: '#e2e8f0', fontWeight: '600', margin: 0 }}>"{reviewTarget.productName}"</p>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>SKU: {reviewTarget.productSku}</p>
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(15,23,42,0.4)', borderRadius: '8px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                    <strong style={{ color: '#64748b' }}>Reason:</strong> {reviewTarget.reason}
                  </p>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Review Note (optional)</label>
                <textarea
                  style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }}
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  placeholder="Add a note for the employee..."
                />
              </div>
              <div style={styles.reviewActions}>
                <button
                  style={{ ...styles.primaryBtn, flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)', justifyContent: 'center' }}
                  onClick={() => handleReview('reject')}
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  style={{ ...styles.primaryBtn, flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', justifyContent: 'center' }}
                  onClick={() => handleReview('approve')}
                >
                  <CheckCircle size={16} /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <ScannerModal onClose={() => setShowScanner(false)} onScan={handleScan} />
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', maxWidth: '900px', margin: '0 auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  pageTitle: { color: '#f8fafc', fontSize: '24px', fontWeight: '700', margin: 0 },
  pageSub: { color: '#64748b', fontSize: '14px', margin: '4px 0 0' },
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '10px 18px', border: 'none', borderRadius: '10px',
    color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  tabs: { display: 'flex', gap: '4px', marginBottom: '20px', background: '#1e293b', padding: '4px', borderRadius: '12px', width: 'fit-content' },
  tab: { padding: '6px 14px', borderRadius: '8px', background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive: { background: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  tabBadge: { background: '#ef4444', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
  infoBox: { display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', marginBottom: '20px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' },
  requestList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  requestCard: { background: '#1e293b', border: '1px solid rgba(148,163,184,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  requestTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  requestLeft: { display: 'flex', flexDirection: 'column', gap: '2px' },
  productName: { color: '#f8fafc', fontSize: '16px', fontWeight: '600', margin: 0 },
  sku: { color: '#475569', fontSize: '12px', fontFamily: 'monospace' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' },
  requestMeta: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  metaItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  metaLabel: { color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  metaValue: { color: '#94a3b8', fontSize: '13px' },
  reasonBox: { padding: '10px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.08)' },
  codePreview: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(99,102,241,0.05)', borderRadius: '10px', border: '1px dashed rgba(99,102,241,0.25)' },
  inlineCode: { fontFamily: 'monospace', fontSize: '20px', fontWeight: '800', color: '#818cf8', letterSpacing: '4px', padding: '4px 10px', background: 'rgba(99,102,241,0.1)', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.2)' },
  actionRow: { display: 'flex' },
  approveBtn: { padding: '8px 16px', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '20px', width: '100%', maxWidth: '440px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(148,163,184,0.08)' },
  modalTitle: { color: '#f8fafc', fontSize: '18px', fontWeight: '600', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
  modalBody: { padding: '24px' },
  scannerIllustration: { width: '100px', height: '100px', background: 'rgba(99,102,241,0.1)', border: '2px solid rgba(99,102,241,0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', flexDirection: 'column', gap: '8px', position: 'relative' },
  scanLines: { display: 'flex', gap: '4px', position: 'absolute', bottom: '12px' },
  scanLine: { width: '16px', height: '3px', background: '#6366f1', borderRadius: '2px', opacity: 0.6 },
  codeInputWrap: { display: 'flex', justifyContent: 'center' },
  codeInput: {
    fontFamily: 'monospace', fontSize: '28px', fontWeight: '800',
    letterSpacing: '8px', textAlign: 'center',
    padding: '12px 20px', background: 'rgba(15,23,42,0.6)',
    border: '2px solid rgba(99,102,241,0.3)', borderRadius: '12px',
    color: '#818cf8', outline: 'none', width: '100%',
    boxSizing: 'border-box', textTransform: 'uppercase',
  },
  errBox: { display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '13px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' },
  successBox: { textAlign: 'center', padding: '8px 0' },
  reviewInfo: { marginBottom: '16px', padding: '16px', background: 'rgba(15,23,42,0.4)', borderRadius: '12px' },
  reviewActions: { display: 'flex', gap: '10px', marginTop: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { color: '#94a3b8', fontSize: '12px', fontWeight: '500' },
  input: { padding: '10px 12px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', color: '#f8fafc', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
};
