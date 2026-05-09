import styles from './QueueCard.module.css';

const STATUS_MAP = {
  waiting:   { label: 'Waiting',   cls: 'waiting'   },
  serving:   { label: 'Serving',   cls: 'serving'   },
  done:      { label: 'Done',      cls: 'done'      },
  skipped:   { label: 'Skipped',   cls: 'skipped'   },
  cancelled: { label: 'Cancelled', cls: 'cancelled' },
  pending:   { label: 'Pending',   cls: 'pending'   },
  approved:  { label: 'Approved',  cls: 'approved'  },
};

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'waiting' };
  return <span className={`${styles.badge} ${styles[s.cls]}`}>{s.label}</span>;
}

export default function QueueCard({ queue, actions }) {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <span className={styles.number}>{queue.queue_number}</span>
        <div className={styles.info}>
          <p className={styles.name}>{queue.student_name}</p>
          <p className={styles.service}>{queue.service}</p>
          <p className={styles.time}>{queue.time_slot}</p>
        </div>
      </div>
      <div className={styles.right}>
        <StatusBadge status={queue.status} />
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}
