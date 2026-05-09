import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const { staffLogin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = params.get('role') || 'cashier';

  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await staffLogin(form.username, form.password);
      navigate('/admin/app');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#1e3a5f"/>
              <circle cx="24" cy="18" r="6" stroke="white" strokeWidth="2.5"/>
              <path d="M12 38c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.logoTitle}>CASHIER-Q RESERVE</h1>
            <p className={styles.logoSub}>{role === 'admin' ? 'Admin Portal' : 'Cashier Portal'}</p>
          </div>
        </div>

        <h2 className={styles.title}>{role === 'admin' ? '🛡️ Admin Login' : '🏦 Cashier Login'}</h2>
        <p className={styles.sub}>Sign in to access the {role} dashboard.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Username</label>
            <input
              type="text" placeholder="Enter username"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <p className={styles.hint}>
            Demo — Username: <strong>{role === 'admin' ? 'admin' : 'cashier_jane'}</strong> / Password: <strong>password</strong>
          </p>
        </form>

        <div className={styles.links}>
          <Link to="/admin" className={styles.back}>← Back to Role Select</Link>
          <Link to="/login" className={styles.student}>Student Portal</Link>
        </div>
      </div>
    </div>
  );
}
