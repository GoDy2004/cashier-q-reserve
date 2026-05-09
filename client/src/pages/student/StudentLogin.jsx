import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './StudentLogin.module.css';

export default function StudentLogin() {
  const { studentLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ student_id: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState('login'); // login | register
  const [regForm, setRegForm] = useState({ full_name: '', student_id: '', course: '', year_section: '', contact_number: '', email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await studentLogin(form.student_id, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.logoTitle}>Cashier-Q</h1>
            <p className={styles.logoSub}>Reserve · University of Cebu</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={tab === 'login' ? styles.tabActive : styles.tab} onClick={() => setTab('login')}>Sign In</button>
          <button className={tab === 'register' ? styles.tabActive : styles.tab} onClick={() => setTab('register')}>Register</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label>Student ID</label>
              <input
                type="text" placeholder="e.g. 24229641"
                value={form.student_id}
                onChange={e => setForm({ ...form, student_id: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input
                type="password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <p className={styles.hint}>
              Demo: ID <strong>24229641</strong> / Password <strong>student123</strong>
            </p>
          </form>
        ) : (
          <RegisterForm />
        )}

        <div className={styles.divider}><span>or</span></div>
        <Link to="/admin" className={styles.adminLink}>Go to Admin / Cashier Portal →</Link>
      </div>
    </div>
  );
}

function RegisterForm() {
  const { studentLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', student_id: '', course: '', year_section: '', contact_number: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { authAPI } = await import('../../services/api');
      await authAPI.studentRegister(form);
      await studentLogin(form.student_id, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <form onSubmit={handle} className={styles.form}>
      {[['full_name','Full Name','e.g. Juan Dela Cruz'],['student_id','Student ID','e.g. 24229641'],['course','Course','e.g. BSIT'],['year_section','Year & Section','e.g. 3-F'],['contact_number','Contact Number','e.g. 0917 123 4567'],['email','Email','you@email.com']].map(([k,l,p]) => (
        <div className={styles.field} key={k}>
          <label>{l}</label>
          <input type={k === 'email' ? 'email' : 'text'} placeholder={p} {...f(k)} required={['full_name','student_id'].includes(k)} />
        </div>
      ))}
      <div className={styles.field}>
        <label>Password</label>
        <input type="password" placeholder="••••••••" {...f('password')} required />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}
