import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './RoleSelect.module.css';

export default function RoleSelect() {
  const { staffUser } = useAuth();
  const navigate = useNavigate();

  if (staffUser) {
    navigate('/admin/app');
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#1e3a5f"/>
              <circle cx="24" cy="18" r="6" stroke="white" strokeWidth="2.5"/>
              <path d="M12 38c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M32 10l2 2 4-4" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.logoTitle}>CASHIER-Q</h1>
            <p className={styles.logoSub}>RESERVE</p>
          </div>
        </div>

        <h2 className={styles.welcome}>Welcome!</h2>
        <p className={styles.sub}>Please select your role to continue.</p>

        <div className={styles.roles}>
          {/* Cashier */}
          <div className={styles.roleCard} onClick={() => navigate('/admin/login?role=cashier')}>
            <div className={styles.roleIcon + ' ' + styles.cashierIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="#2563eb" strokeWidth="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#2563eb" strokeWidth="2"/>
                <line x1="12" y1="12" x2="12" y2="16" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                <line x1="10" y1="14" x2="14" y2="14" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className={styles.roleTitle}>Cashier</h3>
            <p className={styles.roleDesc}>Manage reservations and process payments.</p>
            <button className={styles.cashierBtn}>Continue as Cashier</button>
          </div>

          {/* Admin */}
          <div className={styles.roleCard} onClick={() => navigate('/admin/login?role=admin')}>
            <div className={styles.roleIcon + ' ' + styles.adminIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="#10b981" strokeWidth="2"/>
                <path d="M12 8v4l3 3" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2" fill="#10b981"/>
              </svg>
            </div>
            <h3 className={styles.roleTitle}>Admin</h3>
            <p className={styles.roleDesc}>Manage system settings, users and reports.</p>
            <button className={styles.adminBtn}>Continue as Admin</button>
          </div>
        </div>

        <p className={styles.footer}>© 2025 Cashier-Q Reserve. All rights reserved.</p>
      </div>
    </div>
  );
}
