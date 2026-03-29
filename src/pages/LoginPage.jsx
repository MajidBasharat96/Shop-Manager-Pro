import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Owner', email: 'owner@shopmanager.com', password: 'owner123', color: '#f59e0b' },
  { role: 'Admin', email: 'admin@shopmanager.com', password: 'admin123', color: '#6366f1' },
  { role: 'Supervisor', email: 'supervisor@shopmanager.com', password: 'super123', color: '#10b981' },
  { role: 'Employee', email: 'employee@shopmanager.com', password: 'emp123', color: '#3b82f6' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill in all fields');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (!result.success) setError(result.error);
  };

  const quickLogin = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div style={styles.bg}>
      <div style={styles.grid} />
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.logoWrap}>
            <ShoppingBag size={32} color="#fff" strokeWidth={1.5} />
          </div>
          <h1 style={styles.brandName}>ShopManager <span style={styles.brandPro}>Pro</span></h1>
          <p style={styles.brandSub}>Enterprise Retail Management System</p>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <h2 style={styles.title}>Sign in to your account</h2>
          <p style={styles.subtitle}>Manage your store with role-based access control</p>

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap}>
                <Mail size={16} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={styles.input}
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <Lock size={16} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: '44px' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={styles.eyeBtn}
                >
                  {showPass ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span style={styles.spinner} />
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={styles.demoSection}>
            <div style={styles.demoLabel}>
              <span style={styles.demoLine} />
              <span style={styles.demoText}>Quick Demo Login</span>
              <span style={styles.demoLine} />
            </div>
            <div style={styles.demoGrid}>
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  style={{ ...styles.demoBtn, borderColor: acc.color + '44' }}
                  onClick={() => quickLogin(acc)}
                >
                  <span style={{ ...styles.demoDot, background: acc.color }} />
                  <div>
                    <div style={styles.demoRole}>{acc.role}</div>
                    <div style={styles.demoEmail}>{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={styles.footer}>© 2024 ShopManager Pro · Secure · Role-Based · Production Ready</p>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '480px',
    position: 'relative',
    zIndex: 1,
  },
  brand: { textAlign: 'center', marginBottom: '32px' },
  logoWrap: {
    width: '64px', height: '64px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '20px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 20px 40px rgba(99,102,241,0.4)',
    marginBottom: '16px',
  },
  brandName: { color: '#f8fafc', fontSize: '28px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.5px' },
  brandPro: { color: '#818cf8' },
  brandSub: { color: '#64748b', fontSize: '14px', margin: 0 },
  card: {
    background: 'rgba(30,41,59,0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
  },
  title: { color: '#f8fafc', fontSize: '22px', fontWeight: '600', margin: '0 0 6px', letterSpacing: '-0.3px' },
  subtitle: { color: '#64748b', fontSize: '14px', margin: '0 0 28px' },
  errorBox: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px', padding: '12px 16px',
    display: 'flex', alignItems: 'center', gap: '8px',
    color: '#fca5a5', fontSize: '14px', marginBottom: '20px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#94a3b8', fontSize: '13px', fontWeight: '500' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '12px 14px 12px 40px',
    background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: '10px', color: '#f8fafc', fontSize: '14px',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute', right: '14px',
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: '4px',
  },
  submitBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: '10px',
    color: '#fff', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', marginTop: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '46px',
    boxShadow: '0 8px 20px rgba(99,102,241,0.4)',
    transition: 'opacity 0.2s',
  },
  spinner: {
    width: '20px', height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  demoSection: { marginTop: '28px' },
  demoLabel: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '14px',
  },
  demoLine: { flex: 1, height: '1px', background: 'rgba(148,163,184,0.1)' },
  demoText: { color: '#475569', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' },
  demoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  demoBtn: {
    background: 'rgba(15,23,42,0.4)', border: '1px solid',
    borderRadius: '10px', padding: '10px 12px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
    textAlign: 'left', transition: 'background 0.2s',
  },
  demoDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  demoRole: { color: '#e2e8f0', fontSize: '13px', fontWeight: '600' },
  demoEmail: { color: '#64748b', fontSize: '11px', marginTop: '1px' },
  footer: { color: '#334155', fontSize: '12px', textAlign: 'center', marginTop: '20px' },
};
