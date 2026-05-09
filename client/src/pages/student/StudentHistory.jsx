import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { queueAPI } from '../../services/api';
import styles from './StudentHistory.module.css';

const TABS = ['All', 'Payments', 'Requests', 'Reservations'];

const SERVICE_ICONS = {
  'Tuition Payment':     '💳',
  'Miscellaneous Fee':   '🧾',
  'Receipt Reissuance':  '📄',
  'Payment Verification':'✅',
  'Reservation':         '📅',
  'Clearance':           '🎓',
};

const STATUS_STYLE = {
  done:      { cls: 'completed', label: 'Completed' },
  completed: { cls: 'completed', label: 'Completed' },
  waiting:   { cls: 'pending',   label: 'Pending'   },
  serving:   { cls: 'pending',   label: 'In Progress'},
  skipped:   { cls: 'cancelled', label: 'Skipped'   },
  cancelled: { cls: 'cancelled', label: 'Cancelled' },
  verified:  { cls: 'verified',  label: 'Verified'  },
};

export default function StudentHistory() {
  const { studentUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]         = useState('All');
  const [search, setSearch]   = useState('');
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentUser) return;
      try {
        const res = await queueAPI.getStudentQueues(studentUser.id);
        setItems(res.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, [studentUser]);

  const filtered = items.filter(item => {
    const matchSearch = search === '' ||
      item.service?.toLowerCase().includes(search.toLowerCase()) ||
      item.queue_number?.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'All' ||
      (tab === 'Payments' && ['Tuition Payment', 'Miscellaneous Fee'].includes(item.service)) ||
      (tab === 'Requests' && ['Clearance', 'Receipt Reissuance', 'Payment Verification'].includes(item.service)) ||
      (tab === 'Reservations');
    return matchSearch && matchTab;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')}>
          <BackIcon />
        </button>
        <h1>My Transactions</h1>
        <div />
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >{t}</button>
        ))}
      </div>

      {/* List */}
      <div className={styles.list}>
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className={`${styles.item} skeleton`} style={{ height: 72 }} />
          ))
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span>📭</span>
            <p>No transactions found</p>
          </div>
        ) : (
          filtered.map(item => {
            const s = STATUS_STYLE[item.status] || { cls: 'pending', label: item.status };
            const icon = SERVICE_ICONS[item.service] || '📋';
            return (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}>{icon}</span>
                  <div>
                    <p className={styles.itemService}>{item.service}</p>
                    <p className={styles.itemMeta}>
                      {new Date(item.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                      {item.time_slot && ` · ${item.time_slot}`}
                    </p>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <p className={styles.itemQueue}>{item.queue_number}</p>
                  <span className={`${styles.statusBadge} ${styles[s.cls]}`}>{s.label}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function BackIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function SearchIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{color:'#9ca3af',flexShrink:0}}><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
