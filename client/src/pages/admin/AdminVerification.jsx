import { useState, useEffect } from 'react';
import { verificationAPI } from '../../services/api';
import styles from './AdminVerification.module.css';

export default function AdminVerification() {
  const [items, setItems]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter]     = useState('all');

  const fetchData = async () => {
    try {
      const res = await verificationAPI.getAll(filter !== 'all' ? { status: filter } : {});
      setItems(res.data);
      if (res.data.length > 0 && !selected) setSelected(res.data[0]);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleVerify = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await verificationAPI.verify(selected.id);
      await fetchData();
      setSelected(prev => ({ ...prev, status: 'verified' }));
    } catch {}
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!selected || !window.confirm('Reject this payment?')) return;
    setActionLoading(true);
    try {
      await verificationAPI.reject(selected.id);
      await fetchData();
      setSelected(prev => ({ ...prev, status: 'rejected' }));
    } catch {}
    finally { setActionLoading(false); }
  };

  const STATUS_STYLES = {
    pending:  { cls: styles.pending,  label: 'Pending'  },
    verified: { cls: styles.verified, label: 'Verified' },
    rejected: { cls: styles.rejected, label: 'Rejected' },
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Payment Verification</h1>
        <div className={styles.filterRow}>
          {['all','pending','verified','rejected'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className={styles.cols}>
        {/* List */}
        <div className={styles.listCol}>
          <div className={styles.listCard}>
            {loading ? (
              Array(5).fill(0).map((_,i) => (
                <div key={i} className={`${styles.listItem} skeleton`} style={{height:72}} />
              ))
            ) : items.length === 0 ? (
              <p className={styles.empty}>No verifications found</p>
            ) : (
              items.map(item => {
                const s = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
                return (
                  <div
                    key={item.id}
                    className={`${styles.listItem} ${selected?.id === item.id ? styles.listItemActive : ''}`}
                    onClick={() => setSelected(item)}
                  >
                    <div className={styles.listLeft}>
                      <div className={styles.listAvatar}>{item.student_name?.[0] || '?'}</div>
                      <div>
                        <p className={styles.listName}>{item.student_name}</p>
                        <p className={styles.listService}>{item.service_type}</p>
                        <p className={styles.listAmount}>₱{Number(item.amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</p>
                      </div>
                    </div>
                    <span className={`${styles.badge} ${s.cls}`}>{s.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className={styles.detailCol}>
            <div className={styles.detailCard}>
              <div className={styles.detailCols}>
                {/* Student Info */}
                <div>
                  <h3 className={styles.detailSectionTitle}>Student Information</h3>
                  {[
                    ['Name',           selected.student_name],
                    ['Student ID',     selected.student_id || '—'],
                    ['Course',         selected.course || '—'],
                    ['Year & Section', selected.year_section || '—'],
                    ['Service Type',   selected.service_type],
                    ['Contact Number', selected.contact_number],
                    ['Email',          selected.email],
                  ].map(([l, v]) => (
                    <div className={styles.detailRow} key={l}>
                      <span className={styles.detailLabel}>{l}</span>
                      <span className={styles.detailValue}>{v || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className={styles.detailSectionTitle}>Payment Information</h3>
                  {[
                    ['Reference Number', selected.reference_number],
                    ['Payment Method',   selected.payment_method],
                    ['Amount',           `₱${Number(selected.amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})}`],
                    ['Date Submitted',   selected.submitted_at ? new Date(selected.submitted_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'],
                  ].map(([l, v]) => (
                    <div className={styles.detailRow} key={l}>
                      <span className={styles.detailLabel}>{l}</span>
                      <span className={styles.detailValue}>{v || '—'}</span>
                    </div>
                  ))}

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Attachment</span>
                    <span className={styles.attachLink}>receipt_file.jpg · <button className={styles.viewLink}>View</button></span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status</span>
                    <span className={`${styles.badge} ${STATUS_STYLES[selected.status]?.cls || styles.pending}`}>
                      {STATUS_STYLES[selected.status]?.label || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {selected.status === 'pending' && (
                <div className={styles.actionRow}>
                  <button
                    className={styles.verifyBtn}
                    onClick={handleVerify}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing…' : '✓ Verify Payment'}
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={handleReject}
                    disabled={actionLoading}
                  >✕ Reject Payment</button>
                  <button className={styles.cancelBtn} onClick={() => setSelected(null)}>Cancel</button>
                </div>
              )}
              {selected.status !== 'pending' && (
                <div className={styles.resolvedBanner}>
                  {selected.status === 'verified'
                    ? '✅ This payment has been verified.'
                    : '❌ This payment has been rejected.'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.detailCol}>
            <div className={styles.emptyDetail}>
              <span>🔍</span>
              <p>Select a verification to review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
