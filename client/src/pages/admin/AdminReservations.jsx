import { useState, useEffect } from 'react';
import { reservationAPI } from '../../services/api';
import { StatusBadge } from '../../components/QueueCard';
import styles from './AdminReservations.module.css';

const TABS = ['all', 'waiting', 'serving', 'done', 'cancelled'];

export default function AdminReservations() {
  const [tab, setTab]         = useState('all');
  const [search, setSearch]   = useState('');
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await reservationAPI.getAll({ status: tab === 'all' ? undefined : tab });
      setItems(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const handleApprove = async (id) => {
    try { await reservationAPI.updateStatus(id, 'serving'); fetchData(); } catch {}
  };
  const handleReschedule = async (id) => {
    alert('Reschedule feature coming soon.');
  };

  const filtered = items.filter(item =>
    search === '' ||
    item.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.queue_number?.toLowerCase().includes(search.toLowerCase()) ||
    item.service?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reservations</h1>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            placeholder="Search reservation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Queue No.</th>
                <th>Student</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan="7"><div className="skeleton" style={{height:16,borderRadius:4}} /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className={styles.empty}>No reservations found</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id}>
                    <td><span className={styles.qNum}>{item.queue_number}</span></td>
                    <td className={styles.studentName}>{item.student_name}</td>
                    <td className={styles.service}>{item.service}</td>
                    <td className={styles.date}>{new Date(item.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                    <td className={styles.time}>{item.time_slot}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      {item.status === 'waiting' && (
                        <div className={styles.actions}>
                          <button className={styles.approveBtn} onClick={() => handleApprove(item.id)}>Approve</button>
                          <button className={styles.reschedBtn} onClick={() => handleReschedule(item.id)}>Reschedule</button>
                        </div>
                      )}
                      {item.status === 'done' && (
                        <button className={styles.viewBtn}>View</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{color:'#9ca3af',flexShrink:0}}><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
