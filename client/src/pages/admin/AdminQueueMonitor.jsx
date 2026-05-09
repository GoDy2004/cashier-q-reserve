import { useState, useEffect } from 'react';
import { queueAPI } from '../../services/api';
import { StatusBadge } from '../../components/QueueCard';
import styles from './AdminQueueMonitor.module.css';

export default function AdminQueueMonitor() {
  const [stats, setStats]     = useState(null);
  const [queue, setQueue]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, queueRes] = await Promise.all([
        queueAPI.getStats(),
        queueAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setQueue(queueRes.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 6000);
    return () => clearInterval(t);
  }, []);

  const handleNext = async () => {
    setActionLoading(true);
    try { await queueAPI.callNext(); await fetchData(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
    finally { setActionLoading(false); }
  };

  const handleDone = async (id) => {
    if (!window.confirm('Mark this reservation as completed? This will also update the student\'s transaction history.')) return;
    try { await queueAPI.markDone(id); await fetchData(); } catch {}
  };

  const handleSkip = async (id) => {
    if (!window.confirm('Skip this queue number?')) return;
    try { await queueAPI.skip(id); await fetchData(); } catch {}
  };

  const handleReset = async () => {
    if (!window.confirm('Reset the entire queue for today? This cannot be undone.')) return;
    try { await queueAPI.reset(); await fetchData(); } catch {}
  };

  const nowServing = stats?.now_serving;
  const nextInLine = stats?.next_in_line;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Queue Monitor</h1>
        <button className={styles.resetBtn} onClick={handleReset}>🔄 Reset Queue</button>
      </div>

      <div className={styles.cols}>
        {/* Left — Now serving + controls */}
        <div className={styles.leftCol}>
          <div className={styles.servingCard}>
            <p className={styles.servingLabel}>NOW SERVING</p>
            <h2 className={styles.servingNum}>{nowServing?.queue_number || '—'}</h2>
            {nowServing && (
              <>
                <p className={styles.servingName}>{nowServing.student_name}</p>
                <p className={styles.servingTime}>{nowServing.time_slot}</p>
                <p className={styles.servingService}>{nowServing.service}</p>
              </>
            )}

            {/* Mark Done button — marks current serving as completed */}
            {nowServing && (
              <button
                style={{
                  width: '100%',
                  padding: '11px',
                  marginBottom: 10,
                  background: '#d1fae5',
                  color: '#065f46',
                  border: '1.5px solid #6ee7b7',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                onClick={() => handleDone(nowServing.id)}
              >
                ✓ Mark as Done
              </button>
            )}

            <button
              className={styles.nextBtn}
              onClick={handleNext}
              disabled={actionLoading || !stats?.next_in_line}
            >
              {actionLoading ? 'Calling…' : '▶ Call Next'}
            </button>
          </div>

          {/* Stats */}
          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Queue Statistics</h3>
            {[
              ['Total in Queue',    stats?.total    ?? '—'],
              ['Waiting',           stats?.waiting  ?? '—'],
              ['Completed Today',   stats?.done     ?? '—'],
              ['Average Wait Time', `${stats?.avg_wait_time ?? 15} mins`],
            ].map(([l, v]) => (
              <div key={l} className={styles.statRow}>
                <span className={styles.statLabel}>{l}</span>
                <span className={styles.statVal}>{v}</span>
              </div>
            ))}
          </div>

          {/* Next in line */}
          {nextInLine && (
            <div className={styles.nextCard}>
              <p className={styles.nextLabel}>Next in Line</p>
              <h3 className={styles.nextNum}>{nextInLine.queue_number}</h3>
              <p className={styles.nextName}>{nextInLine.student_name}</p>
              <p className={styles.nextTime}>{nextInLine.time_slot}</p>
            </div>
          )}
        </div>

        {/* Right — Queue list */}
        <div className={styles.rightCol}>
          <div className={styles.listCard}>
            <h3 className={styles.listTitle}>Queue List</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Queue No.</th>
                    <th>Student</th>
                    <th>Service</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(6).fill(0).map((_, i) => (
                      <tr key={i}><td colSpan="6"><div className="skeleton" style={{height:16,borderRadius:4}} /></td></tr>
                    ))
                  ) : queue.length === 0 ? (
                    <tr><td colSpan="6" className={styles.empty}>No queue today</td></tr>
                  ) : (
                    queue.map(q => (
                      <tr key={q.id} className={q.status === 'serving' ? styles.activeRow : ''}>
                        <td><span className={styles.qNum}>{q.queue_number}</span></td>
                        <td>{q.student_name}</td>
                        <td className={styles.service}>{q.service}</td>
                        <td className={styles.time}>{q.time_slot}</td>
                        <td><StatusBadge status={q.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {q.status === 'serving' && (
                              <button
                                style={{
                                  padding: '5px 10px',
                                  background: '#d1fae5',
                                  color: '#065f46',
                                  border: '1px solid #6ee7b7',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleDone(q.id)}
                              >Done</button>
                            )}
                            {q.status === 'waiting' && (
                              <button className={styles.skipBtn} onClick={() => handleSkip(q.id)}>Skip</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
