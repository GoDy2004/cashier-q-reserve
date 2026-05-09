import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { queueAPI } from '../../services/api';
import styles from './StudentHome.module.css';

const QUICK_ACTIONS = [
  { icon: '📅', label: 'Reserve Slot', to: '/reserve' },
  { icon: '⏱️', label: 'Queue Monitor', to: '/queue' },
  { icon: '🧾', label: 'Transactions', to: '/transactions' },
  { icon: '📋', label: 'Request Form', to: '/history' },
];

export default function StudentHome() {
  const { studentUser } = useAuth();
  const navigate = useNavigate();
  const [myQueue, setMyQueue]   = useState(null);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = studentUser?.full_name?.split(' ')[0] || 'Student';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, myRes] = await Promise.all([
          queueAPI.getStats(),
          studentUser ? queueAPI.getStudentQueues(studentUser.id) : Promise.resolve({ data: [] }),
        ]);
        setStats(statsRes.data);
        const active = myRes.data.find(q => ['waiting', 'serving'].includes(q.status));
        setMyQueue(active || null);
      } catch { /* offline fallback */ }
      finally { setLoading(false); }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [studentUser]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>
            {firstName[0]}
          </div>
          <div>
            <p className={styles.greeting}>{greeting}, {firstName}! 👋</p>
            <p className={styles.subGreeting}>
              {studentUser?.student_id} · {studentUser?.course} {studentUser?.year_section}
            </p>
          </div>
        </div>
        <button className={styles.bell}>
          <BellIcon />
          <span className={styles.bellDot} />
        </button>
      </div>

      {/* My Queue Card */}
      {!loading && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>My Queue</span>
            {myQueue && (
              <span className={`${styles.badge} ${myQueue.status === 'serving' ? styles.serving : styles.upcoming}`}>
                {myQueue.status === 'serving' ? 'Now Serving' : 'Upcoming'}
              </span>
            )}
          </div>

          {myQueue ? (
            <div className={styles.queueCard}>
              <p className={styles.queueLabel}>Your Queue Number</p>
              <h2 className={styles.queueNumber}>{myQueue.queue_number}</h2>
              <div className={styles.queueMeta}>
                <span>📅 {new Date(myQueue.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', weekday:'short' })}</span>
                <span>🕐 {myQueue.time_slot}</span>
              </div>
              <div className={styles.queueStats}>
                <div className={styles.queueStat}>
                  <span className={styles.statNum}>{stats?.waiting || 0}</span>
                  <span className={styles.statLabel}>People Ahead</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.queueStat}>
                  <span className={styles.statNum}>{(stats?.waiting || 0) * 5} mins</span>
                  <span className={styles.statLabel}>Estimated Wait Time</span>
                </div>
              </div>
              <button className={styles.viewBtn} onClick={() => navigate('/queue')}>View Details</button>
            </div>
          ) : (
            <div className={styles.noQueue}>
              <span className={styles.noQueueIcon}>🎫</span>
              <p>No active reservation</p>
              <button className={styles.reserveBtn} onClick={() => navigate('/reserve')}>Reserve a Slot</button>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Quick Actions</span>
          <button className={styles.seeAll}>See all</button>
        </div>
        <div className={styles.quickGrid}>
          {QUICK_ACTIONS.map(({ icon, label, to }) => (
            <button key={label} className={styles.quickAction} onClick={() => navigate(to)}>
              <span className={styles.quickIcon}>{icon}</span>
              <span className={styles.quickLabel}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Now Serving Banner */}
      {stats?.now_serving && (
        <div className={styles.section}>
          <div className={styles.servingBanner}>
            <div>
              <p className={styles.servingLabel}>Now Serving at Main Cashier</p>
              <h3 className={styles.servingNum}>{stats.now_serving.queue_number}</h3>
              <p className={styles.servingName}>{stats.now_serving.student_name}</p>
            </div>
            <div className={styles.servingIcon}>🏦</div>
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
