import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { transactionAPI, verificationAPI, queueAPI } from '../../services/api';
import styles from './StudentTransaction.module.css';

const SERVICES = ['Tuition Payment','Miscellaneous Fee','Clearance','Receipt Reissuance','Payment Verification','Insurance'];
const PAYMENT_METHODS = ['Online Banking','GCash','Maya','Bank Transfer','Cash'];

export default function StudentTransaction() {
  const { studentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView]         = useState('list'); // list | pay | success
  const [transactions, setTx]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [form, setForm] = useState({
    service: 'Tuition Payment',
    amount: '',
    reference_number: '',
    payment_method: 'Online Banking',
    queue_number: location.state?.queue_number || '',
    notes: '',
  });

  const fetchTx = async () => {
    if (!studentUser) return;
    try {
      const res = await transactionAPI.getAll({ student_id: studentUser.id });
      setTx(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTx(); }, [studentUser]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.reference_number) {
      alert('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      // Create transaction record
      const txRes = await transactionAPI.create({
        student_id: studentUser?.id,
        student_name: studentUser?.full_name,
        service: form.service,
        amount: parseFloat(form.amount),
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        reference_number: form.reference_number,
        payment_method: form.payment_method,
      });

      // Submit for verification
      await verificationAPI.submit({
        student_id: studentUser?.id,
        student_name: studentUser?.full_name,
        reference_number: form.reference_number,
        payment_method: form.payment_method,
        amount: parseFloat(form.amount),
        service_type: form.service,
        contact_number: studentUser?.contact_number,
        email: studentUser?.email,
      });

      setSuccessData({ ...form, id: txRes.data.id });
      setView('success');
      fetchTx();
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const STATUS_MAP = {
    completed: { label: 'Completed', cls: styles.completed },
    pending:   { label: 'Pending',   cls: styles.pending   },
    cancelled: { label: 'Cancelled', cls: styles.cancelled },
    verified:  { label: 'Verified',  cls: styles.verified  },
  };

  const SERVICE_ICONS = {
    'Tuition Payment':     '💳',
    'Miscellaneous Fee':   '🧾',
    'Clearance':          '📄',
    'Grade Slip':         '📃',
    'Insurance':           '🛡️',
  };

  if (view === 'success' && successData) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => { setView('list'); setForm({ service:'Tuition Payment', amount:'', reference_number:'', payment_method:'Online Banking', queue_number:'', notes:'' }); }}>
            <BackIcon />
          </button>
          <h1>Payment Submitted</h1>
          <div />
        </div>
        <div className={styles.successWrap}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Payment Submitted!</h2>
            <p className={styles.successSub}>Your payment has been submitted for verification. You will be notified once it is processed.</p>
            <div className={styles.successDetails}>
              {[
                ['Service',          successData.service],
                ['Amount',           `₱${Number(successData.amount).toLocaleString('en-PH',{minimumFractionDigits:2})}`],
                ['Reference No.',    successData.reference_number],
                ['Payment Method',   successData.payment_method],
                ['Status',           'Pending Verification'],
              ].map(([l, v]) => (
                <div className={styles.successRow} key={l}>
                  <span className={styles.successLabel}>{l}</span>
                  <span className={styles.successValue}>{v}</span>
                </div>
              ))}
            </div>
            <button className={styles.doneBtn} onClick={() => { setView('list'); fetchTx(); }}>View My Transactions</button>
            <button className={styles.homeBtn} onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'pay') {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => setView('list')}><BackIcon /></button>
          <h1>Submit Payment</h1>
          <div />
        </div>
        <form className={styles.payForm} onSubmit={handleSubmit}>
          <div className={styles.payCard}>
            <h3 className={styles.paySection}>Payment Details</h3>

            <div className={styles.field}>
              <label>Service / Purpose <span className={styles.req}>*</span></label>
              <select value={form.service} onChange={e => set('service', e.target.value)}>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label>Amount (₱) <span className={styles.req}>*</span></label>
              <input
                type="number" min="0" step="0.01" placeholder="e.g. 25500.00"
                value={form.amount} onChange={e => set('amount', e.target.value)} required
              />
            </div>

            <div className={styles.field}>
              <label>Payment Method <span className={styles.req}>*</span></label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label>Reference / Transaction No. <span className={styles.req}>*</span></label>
              <input
                type="text" placeholder="e.g. TUT-2025-00002"
                value={form.reference_number} onChange={e => set('reference_number', e.target.value)} required
              />
            </div>

            <div className={styles.field}>
              <label>Queue Number (optional)</label>
              <input
                type="text" placeholder="e.g. Q-008"
                value={form.queue_number} onChange={e => set('queue_number', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Notes (optional)</label>
              <textarea
                rows={3} placeholder="Add any notes..."
                value={form.notes} onChange={e => set('notes', e.target.value)}
              />
            </div>
          </div>

          {/* Student info recap */}
          <div className={`${styles.payCard} ${styles.infoCard}`}>
            <h3 className={styles.paySection}>Your Information</h3>
            {[
              ['Name',    studentUser?.full_name],
              ['ID',      studentUser?.student_id],
              ['Course',  `${studentUser?.course} ${studentUser?.year_section}`],
              ['Contact', studentUser?.contact_number],
              ['Email',   studentUser?.email],
            ].map(([l, v]) => (
              <div className={styles.infoRow} key={l}>
                <span className={styles.infoLabel}>{l}</span>
                <span className={styles.infoValue}>{v || '—'}</span>
              </div>
            ))}
          </div>

          <div className={styles.notice}>
            <span>ℹ️</span>
            <p>Your payment will be reviewed by the cashier. Make sure your reference number is correct. You will be notified once verified.</p>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Submitting…' : '💳 Submit Payment'}
          </button>
        </form>
      </div>
    );
  }

  // List view
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')}><BackIcon /></button>
        <h1>My Transactions</h1>
        <div />
      </div>

      {/* Summary */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>📋</span>
          <div>
            <p className={styles.summaryLabel}>Total</p>
            <p className={styles.summaryNum}>{transactions.filter(t=>t.reference_number).length}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>✅</span>
          <div>
            <p className={styles.summaryLabel}>Completed</p>
            <p className={styles.summaryNum}>{transactions.filter(t=>t.reference_number&&(t.status==='completed'||t.status==='verified')).length}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>⏳</span>
          <div>
            <p className={styles.summaryLabel}>Pending</p>
            <p className={styles.summaryNum}>{transactions.filter(t=>t.reference_number&&t.status==='pending').length}</p>
          </div>
        </div>
      </div>

      {/* New payment CTA */}
      <div className={styles.ctaWrap}>
        <button className={styles.payBtn} onClick={() => setView('pay')}>
          <span>💳</span> Submit New Payment
        </button>
      </div>

      {/* List */}
      <div className={styles.listWrap}>
        <h3 className={styles.listTitle}>Transaction History</h3>
        {loading ? (
          Array(4).fill(0).map((_,i) => (
            <div key={i} className={`${styles.txItem} skeleton`} style={{height:72}} />
          ))
        ) : transactions.filter(tx => tx.reference_number).length === 0 ? (
          <div className={styles.empty}>
            <span>📭</span>
            <p>No transactions yet</p>
            <button className={styles.startBtn} onClick={() => setView('pay')}>Submit First Payment</button>
          </div>
        ) : (
          transactions.filter(tx => tx.reference_number).map(tx => {
            const s = STATUS_MAP[tx.status] || STATUS_MAP.pending;
            const icon = SERVICE_ICONS[tx.service] || '💳';
            return (
              <div key={tx.id} className={styles.txItem}>
                <div className={styles.txLeft}>
                  <span className={styles.txIcon}>{icon}</span>
                  <div>
                    <p className={styles.txService}>{tx.service}</p>
                    <p className={styles.txMeta}>
                      {tx.date ? new Date(tx.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                      {tx.time_processed ? ` · ${tx.time_processed}` : ''}
                    </p>
                    {tx.reference_number && (
                      <p className={styles.txRef}>Ref: {tx.reference_number}</p>
                    )}
                  </div>
                </div>
                <div className={styles.txRight}>
                  <p className={styles.txAmount}>
                    {tx.queue_number && !tx.reference_number
                      ? <span style={{color:'#9ca3af',fontSize:'0.9em'}}>—</span>
                      : `₱${Number(tx.amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})}`
                    }
                  </p>
                  <span className={`${styles.badge} ${s.cls}`}>{s.label}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}