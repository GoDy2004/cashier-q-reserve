import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { queueAPI } from '../../services/api';
import styles from './StudentQueue.module.css';

export default function StudentQueue() {
  const { studentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [myQueue, setMyQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, myRes] = await Promise.all([
        queueAPI.getStats(),
        studentUser ? queueAPI.getStudentQueues(studentUser.id) : Promise.resolve({ data: [] }),
      ]);
      setStats(statsRes.data);
      const active = myRes.data.find(q => ['waiting', 'serving'].includes(q.status));
      setMyQueue(active || null);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 8000);
    return () => clearInterval(t);
  }, [studentUser]);

  const handleCancel = async () => {
    if (!myQueue || !window.confirm('Cancel your reservation?')) return;
    try {
      await queueAPI.cancel(myQueue.id);
      setMyQueue(null);
      fetchData();
    } catch {}
  };

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  const nowServing = stats?.now_serving;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')}>
          <BackIcon />
        </button>
        <h1>Queue Monitor</h1>
        <button className={styles.refresh} onClick={fetchData}><RefreshIcon /></button>
      </div>

      <div className={styles.content}>
        {/* Cashier info */}
        <div className={styles.cashierCard}>
          <p className={styles.cashierUni}>University of Cebu</p>
          <p className={styles.cashierName}>MAIN CASHIER</p>
          <p className={styles.nowLabel}>Now Serving</p>
          <h2 className={styles.nowNum}>{nowServing?.queue_number || '—'}</h2>
          <p className={styles.nowTime}>
            {nowServing ? `${new Date(nowServing.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} · ${nowServing.time_slot}` : 'No active queue'}
          </p>
        </div>

        {/* My Queue */}
        {myQueue && (
          <div className={styles.myQueueCard}>
            <p className={styles.myQueueLabel}>Your Queue</p>
            <h3 className={styles.myQueueNum}>{myQueue.queue_number}</h3>

            {/* Progress dots */}
            <div className={styles.progress}>
              <div className={styles.progressDot + ' ' + styles.done}>✓</div>
              <div className={styles.progressLine} />
              <div className={`${styles.progressDot} ${myQueue.status === 'serving' ? styles.active : styles.pending}`}>
                {myQueue.status === 'serving' ? '●' : '○'}
              </div>
              <div className={styles.progressLine} />
              <div className={styles.progressDot + ' ' + styles.pending}>🚶</div>
            </div>

            {myQueue.status === 'serving' ? (
              <p className={styles.nextLine}>🔥 You're being served now!</p>
            ) : (
              <p className={styles.nextLine}>🔥 You're next in line</p>
            )}

            <div className={styles.waitStats}>
              <div className={styles.waitStat}>
                <span className={styles.waitNum}>{stats?.waiting || 0}</span>
                <span className={styles.waitLabel}>People Ahead</span>
              </div>
              <div className={styles.waitDivider} />
              <div className={styles.waitStat}>
                <span className={styles.waitNum}>{(stats?.waiting || 0) * 5} mins</span>
                <span className={styles.waitLabel}>Estimated Wait Time</span>
              </div>
            </div>

            <div className={styles.reminder}>
              <span className={styles.reminderIcon}>🔔</span>
              <div>
                <p className={styles.reminderTitle}>Reminder</p>
                <p className={styles.reminderText}>Please be at the cashier area 10 minutes before your schedule.</p>
              </div>
            </div>

            <button className={styles.cancelBtn} onClick={handleCancel}>Cancel Reservation</button>
          </div>
        )}

        {!myQueue && (
          <div className={styles.noQueue}>
            <p>You have no active reservation.</p>
            <button className={styles.reserveBtn} onClick={() => navigate('/reserve')}>Reserve a Slot →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function BackIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function RefreshIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="23,4 23,10 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
