import { useState, useEffect } from 'react';
import { verificationAPI } from '../../services/api';
import styles from './AdminTransactions.module.css';

const STATUS_STYLE = {
  completed: { cls: 'completed', label: 'Completed' },
  pending:   { cls: 'pending',   label: 'Pending'   },
  cancelled: { cls: 'cancelled', label: 'Cancelled' },
  verified:  { cls: 'verified',  label: 'Verified'  },
  rejected:  { cls: 'cancelled', label: 'Rejected'  },
};

export default function AdminTransactions() {
  const [items, setItems]     = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const fetchData = async () => {
    try {
      const pvRes = await verificationAPI.getAll();
      setItems(pvRes.data);

      // Compute stats directly from payment_verifications data
      const all = pvRes.data;
      const today = new Date().toISOString().split('T')[0];
      const todayItems = all.filter(pv => pv.submitted_at && pv.submitted_at.slice(0, 10) === today);
      const total_transactions = todayItems.length;
      const total_amount = todayItems.filter(pv => pv.status === 'verified').reduce((sum, pv) => sum + Number(pv.amount || 0), 0);
      const tuition_payments = todayItems.filter(pv => pv.service_type === 'Tuition Payment').length;
      const other_payments = todayItems.filter(pv => pv.service_type !== 'Tuition Payment').length;
      setStats({ total_transactions, total_amount, tuition_payments, other_payments });
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter(item =>
    search === '' ||
    item.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.service_type?.toLowerCase().includes(search.toLowerCase()) ||
    item.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
    item.student_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transactions</h1>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className={styles.statsRow}>
          {[
            { label: 'TOTAL TRANSACTIONS', value: stats.total_transactions, cls: 'blue' },
            { label: 'TOTAL AMOUNT',        value: `₱${Number(stats.total_amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})}`, cls: 'green' },
            { label: 'TUITION PAYMENTS',    value: stats.tuition_payments, cls: 'indigo' },
            { label: 'OTHER PAYMENTS',      value: stats.other_payments,   cls: 'orange' },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`${styles.statCard} ${styles[cls]}`}>
              <p className={styles.statLabel}>{label}</p>
              <p className={styles.statValue}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Reference No.</th>
                <th>Student</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan="7"><div className="skeleton" style={{height:16,borderRadius:4}} /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className={styles.empty}>No transactions found</td></tr>
              ) : (
                filtered.map(item => {
                  const s = STATUS_STYLE[item.status] || { cls: 'pending', label: item.status };
                  return (
                    <tr key={item.id}>
                      <td><span className={styles.qNum}>{item.reference_number || '—'}</span></td>
                      <td className={styles.studentName}>
                        <div>{item.student_name}</div>
                        {item.student_id && <div style={{fontSize:11,color:'#6b7280'}}>{item.student_id}</div>}
                      </td>
                      <td className={styles.service}>{item.service_type}</td>
                      <td className={styles.amount}>
                        ₱{Number(item.amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})}
                      </td>
                      <td className={styles.date}>
                        {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                      </td>
                      <td className={styles.time}>
                        {item.submitted_at ? new Date(item.submitted_at).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true}) : '—'}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[s.cls]}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{color:'#9ca3af',flexShrink:0}}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}


