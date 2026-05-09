import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { queueAPI, reservationAPI, verificationAPI, transactionAPI, scheduleAPI } from '../../services/api';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [queue, setQueue]       = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [txStats, setTxStats]   = useState(null);
  const [pending, setPending]   = useState(0);
  const [loading, setLoading]   = useState(true);

  const fetchAll = async () => {
    try {
      const [qStats, qAll, sch, tx, pend] = await Promise.all([
        queueAPI.getStats(),
        queueAPI.getAll({ status: 'waiting' }),
        scheduleAPI.getToday(),
        transactionAPI.getStats(),
        verificationAPI.getPendingCount(),
      ]);
      setStats(qStats.data);
      setQueue(qAll.data.slice(0, 5));
      setSchedules(sch.data);
      setTxStats(tx.data);
      setPending(pend.data.count);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 10000);
    return () => clearInterval(t);
  }, []);

  const STAT_CARDS = [
    {
      label: 'NOW SERVING',
      value: stats?.now_serving?.queue_number || '—',
      sub: stats?.now_serving?.student_name || 'No active',
      sub2: stats?.now_serving?.time_slot || '',
      color: 'blue',
      icon: <MonitorIcon />,
    },
    {
      label: "TODAY'S RESERVATIONS",
      value: stats?.total ?? '—',
      sub: 'Total scheduled reservations',
      color: 'indigo',
      icon: <CalIcon />,
    },
    {
      label: 'PENDING VERIFICATION',
      value: pending ?? '—',
      sub: 'Payments awaiting verification',
      color: 'orange',
      icon: <ClockIcon />,
    },
    {
      label: 'COMPLETED TODAY',
      value: txStats?.total ?? stats?.done ?? '—',
      sub: 'Completed transactions',
      color: 'purple',
      icon: <CheckIcon />,
    },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((card) => (
          <div key={card.label} className={`${styles.statCard} ${styles[card.color]}`}>
            <div className={styles.statTop}>
              <div>
                <p className={styles.statLabel}>{card.label}</p>
                <h2 className={styles.statValue}>{card.value}</h2>
              </div>
              <div className={styles.statIcon}>{card.icon}</div>
            </div>
            <p className={styles.statSub}>{card.sub}</p>
            {card.sub2 && <p className={styles.statSub2}>{card.sub2}</p>}
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className={styles.cols}>
        {/* Upcoming Queue */}
        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>Upcoming Queue</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Queue No.</th>
                <th>Student</th>
                <th>Time</th>
                <th>Service</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan="4"><div className="skeleton" style={{height:18, borderRadius:4}} /></td></tr>
                ))
              ) : queue.length === 0 ? (
                <tr><td colSpan="4" className={styles.empty}>No upcoming queue</td></tr>
              ) : (
                queue.map(q => (
                  <tr key={q.id}>
                    <td><span className={styles.qNum}>{q.queue_number}</span></td>
                    <td>{q.student_name}</td>
                    <td className={styles.timeCell}>{q.time_slot?.split(' - ')[0]}</td>
                    <td>{q.service}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <button className={styles.viewAllBtn} onClick={() => navigate('/admin/app/queue')}>
            View Full Queue
          </button>
        </div>

        {/* Today's Schedule */}
        <div className={styles.scheduleCard}>
          <h2 className={styles.cardTitle}>Today's Schedule</h2>
          <div className={styles.scheduleList}>
            {schedules.length === 0 ? (
              <p className={styles.empty}>No schedules set</p>
            ) : (
              schedules.map(s => (
                <div key={s.id} className={styles.scheduleItem}>
                  <div className={`${styles.schedDot} ${styles[s.status]}`} />
                  <div>
                    <p className={styles.schedTime}>
                      {s.start_time?.slice(0,5)} AM – {s.end_time?.slice(0,5)} PM
                    </p>
                    <p className={styles.schedLabel}>{s.label}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonitorIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function CalIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function ClockIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function CheckIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
