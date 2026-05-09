import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { queueAPI } from '../../services/api';
import styles from './StudentReserve.module.css';

const SERVICES  = ['Tuition Payment', 'Miscellaneous Fee', 'Clearance', 'Grade Slip', 'Insurance'];
const BRANCHES  = ['Main Campus', 'UCLM Campus', 'Banilad Campus'];
const TIME_SLOTS = ['8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM'];

function getDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export default function StudentReserve() {
  const { studentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [form, setForm] = useState({
    date: '',
    time_slot: '',
    service: 'Tuition Payment',
    branch: 'Main Campus',
    full_name: studentUser?.full_name || '',
    student_id: studentUser?.student_id || '',
    course: studentUser?.course || '',
    year_section: studentUser?.year_section || '',
    contact_number: studentUser?.contact_number || '',
    email: studentUser?.email || '',
  });

  const dates = getDates();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await queueAPI.create({
        student_name: form.full_name,
        service: form.service,
        branch: form.branch,
        date: form.date,
        time_slot: form.time_slot,
        student_id: studentUser?.id,
      });
      setConfirmed(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Reservation failed');
    } finally { setLoading(false); }
  };

  if (confirmed) return <ConfirmedScreen confirmed={confirmed} form={form} onHome={() => navigate('/')} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}>
          <BackIcon />
        </button>
        <h1>Reserve Slot</h1>
        <div />
      </div>

      {/* Steps */}
      <div className={styles.steps}>
        {['Select Slot', 'Your Info', 'Review'].map((label, i) => (
          <div key={label} className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${step > i+1 ? styles.done : step === i+1 ? styles.current : styles.future}`}>
              {step > i+1 ? '✓' : i+1}
            </div>
            <span className={`${styles.stepLabel} ${step === i+1 ? styles.stepActive : ''}`}>{label}</span>
            {i < 2 && <div className={`${styles.stepLine} ${step > i+1 ? styles.lineDone : ''}`} />}
          </div>
        ))}
      </div>

      <div className={styles.content}>
        {/* Step 1 */}
        {step === 1 && (
          <div className={styles.fadeIn}>
            <section className={styles.section}>
              <h3 className={styles.fieldLabel}>Select Date</h3>
              <div className={styles.dateRow}>
                {dates.map((d) => {
                  const iso = d.toISOString().split('T')[0];
                  const day = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <button
                      key={iso}
                      className={`${styles.dateChip} ${form.date === iso ? styles.dateSelected : ''}`}
                      onClick={() => set('date', iso)}
                    >
                      <span className={styles.dateDay}>{date.split(' ')[1]}</span>
                      <span className={styles.dateMon}>{day}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.fieldLabel}>Select Time</h3>
              <div className={styles.timeList}>
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    className={`${styles.timeChip} ${form.time_slot === t ? styles.timeSelected : ''}`}
                    onClick={() => set('time_slot', t)}
                  >{t}</button>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.fieldLabel}>Service / Purpose</h3>
              <select className={styles.select} value={form.service} onChange={e => set('service', e.target.value)}>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </section>

            <section className={styles.section}>
              <h3 className={styles.fieldLabel}>Branch / Campus</h3>
              <select className={styles.select} value={form.branch} onChange={e => set('branch', e.target.value)}>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </section>

            <button
              className={styles.nextBtn}
              disabled={!form.date || !form.time_slot}
              onClick={() => setStep(2)}
            >Next</button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className={styles.fadeIn}>
            <h3 className={styles.sectionTitle}>Personal Information</h3>
            {[
              ['full_name',      'Full Name',       'text'],
              ['student_id',     'Student ID',      'text'],
              ['course',         'Course',          'text'],
              ['year_section',   'Year & Section',  'text'],
              ['contact_number', 'Contact Number',  'tel'],
              ['email',          'Email Address',   'email'],
            ].map(([k, l, t]) => (
              <div className={styles.inputGroup} key={k}>
                <label className={styles.inputLabel}>{l}</label>
                <input
                  type={t}
                  className={styles.input}
                  value={form[k]}
                  onChange={e => set(k, e.target.value)}
                />
              </div>
            ))}
            <button className={styles.nextBtn} onClick={() => setStep(3)}>Next</button>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className={styles.fadeIn}>
            <h3 className={styles.sectionTitle}>Review Your Reservation</h3>
            <div className={styles.reviewCard}>
              {[
                ['Date',             new Date(form.date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric', year:'numeric' })],
                ['Time',             form.time_slot],
                ['Service / Purpose',form.service],
                ['Branch / Campus',  form.branch],
              ].map(([l, v]) => (
                <div className={styles.reviewRow} key={l}>
                  <span className={styles.reviewLabel}>{l}</span>
                  <span className={styles.reviewValue}>{v}</span>
                </div>
              ))}
            </div>

            <h3 className={styles.sectionTitle} style={{ marginTop: 20 }}>Personal Information</h3>
            <div className={styles.reviewCard}>
              {[
                ['Name',           form.full_name],
                ['Student ID',     form.student_id],
                ['Course',         form.course],
                ['Year & Section', form.year_section],
                ['Contact',        form.contact_number],
              ].map(([l, v]) => (
                <div className={styles.reviewRow} key={l}>
                  <span className={styles.reviewLabel}>{l}</span>
                  <span className={styles.reviewValue}>{v}</span>
                </div>
              ))}
            </div>

            <button className={styles.confirmBtn} onClick={handleConfirm} disabled={loading}>
              {loading ? 'Confirming…' : 'Confirm Reservation'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmedScreen({ confirmed, form, onHome }) {
  return (
    <div className={styles.confirmedPage}>
      <div className={styles.confirmedCard}>
        <div className={styles.checkCircle}>✓</div>
        <h2 className={styles.confirmedTitle}>Reservation Confirmed!</h2>
        <p className={styles.confirmedSub}>Your slot has been successfully reserved.</p>

        <div className={styles.confirmedDetails}>
          <p className={styles.detailLabel}>Queue Number</p>
<h3 className={styles.detailQNum}>{confirmed.queue_number}</h3>

{confirmed.reference_number && (
  <>
    <p className={styles.detailLabel} style={{ marginTop: 12 }}>Reference Number</p>
    <h3 className={styles.detailQNum} style={{ fontSize: '1rem', letterSpacing: 1 }}>
      {confirmed.reference_number}
    </h3>
  </>
)}

          <div className={styles.detailRows}>
            {[
              ['Service / Purpose', form.service],
              ['Date', new Date(form.date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric', year:'numeric' })],
              ['Time', form.time_slot],
              ['Branch / Campus', form.branch],
            ].map(([l, v]) => (
              <div className={styles.detailRow} key={l}>
                <span className={styles.detailRowLabel}>{l}</span>
                <span className={styles.detailRowValue}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.notifNote}>
          <span>⭐</span>
          <p>You will receive a notification once your turn is near.</p>
        </div>

        <button className={styles.homeBtn} onClick={onHome}>Go to Home</button>
      </div>
    </div>
  );
}

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
