import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import styles from './AdminReports.module.css';

export default function AdminReports() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('All Reports');
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate]     = useState(today);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getSummary({ start_date: startDate, end_date: endDate });
      setData(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  // ── CSV Export ──────────────────────────────────────
  const handleGenerateReport = async () => {
    // Re-fetch latest data first, then export
    setLoading(true);
    let reportData = data;
    try {
      const res = await reportAPI.getSummary({ start_date: startDate, end_date: endDate });
      reportData = res.data;
      setData(reportData);
    } catch {}
    finally { setLoading(false); }

    if (!reportData) return;

    // Filter transactions by reportType
    let transactions = reportData.recent_transactions || [];
    if (reportType !== 'All Reports') {
      transactions = transactions.filter(tx => tx.service === reportType);
    }

    // Build CSV rows
    const rows = [];

    // Title block
    rows.push([`Cashier-Q Reserve — ${reportType}`]);
    rows.push([`Date Range: ${startDate} to ${endDate}`]);
    rows.push([`Generated: ${new Date().toLocaleString('en-PH')}`]);
    rows.push([]);

    // Summary block
    rows.push(['SUMMARY']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Transactions', reportData.total_transactions]);
    rows.push(['Total Amount Collected', `₱${Number(reportData.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`]);
    rows.push(['Tuition Payments', reportData.tuition_payments]);
    rows.push(['Miscellaneous Fees', reportData.misc_fees]);
    rows.push(['Clearance', reportData.clearance]);
    rows.push(['Insurance', reportData.insurance]);
    rows.push(['Other', reportData.other]);
    rows.push([]);

    // Service breakdown
    rows.push(['SERVICE BREAKDOWN']);
    rows.push(['Service', 'Count', 'Percentage']);
    (reportData.service_breakdown || []).forEach(item => {
      rows.push([item.name, item.value, `${item.percent}%`]);
    });
    rows.push([]);

    // Transactions detail
    rows.push(['TRANSACTION DETAILS']);
    rows.push(['Student ID', 'Reference No.', 'Student Name', 'Service', 'Amount', 'Status', 'Date', 'Time']);
    transactions.forEach((tx) => {
      rows.push([
        tx.student_number || '—',
        tx.reference_number || '—',
        tx.student_name || '—',
        tx.service || '—',
        Number(tx.amount || 0).toFixed(2),
        tx.status || '—',
        tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        tx.created_at ? new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
      ]);
    });

    if (transactions.length === 0) {
      rows.push(['No transactions found for the selected filters.']);
    }

    // Convert to CSV string
    const csvContent = rows.map(row =>
      row.map(cell => {
        const val = String(cell ?? '');
        // Wrap in quotes if it contains comma, quote, or newline
        return val.includes(',') || val.includes('"') || val.includes('\n')
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      }).join(',')
    ).join('\r\n');

    // Trigger download
    const BOM = '\uFEFF'; // UTF-8 BOM so Excel reads ₱ correctly
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `cashierq-report-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#6366f1','#3b82f6','#f59e0b','#ef4444','#8b5cf6'];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Reports</h1>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>Report Type</label>
          <select value={reportType} onChange={e => setReportType(e.target.value)}>
            {['All Reports','Tuition Payment','Miscellaneous Fee','Clearance','Insurance'].map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className={styles.controlGroup}>
          <label>Date Range</label>
          <div className={styles.dateRange}>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span>–</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <button className={styles.generateBtn} onClick={handleGenerateReport} disabled={loading}>
          {loading ? 'Generating…' : '⬇ Generate Report'}
        </button>
      </div>

      {data && (
        <>
          {/* Summary cards */}
          <div className={styles.summaryGrid}>
            {[
              { label: 'TOTAL TRANSACTIONS', value: data.total_transactions,  color: '#2563eb' },
              { label: 'TOTAL AMOUNT',        value: `₱${Number(data.total_amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})}`, color: '#10b981' },
              { label: 'TUITION PAYMENTS',    value: data.tuition_payments,   color: '#6366f1' },
              { label: 'OTHER PAYMENTS',      value: data.other ?? (data.misc_fees + data.clearance + data.insurance), color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} className={styles.summaryCard} style={{ borderLeftColor: color }}>
                <p className={styles.summaryLabel}>{label}</p>
                <p className={styles.summaryValue} style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          <div className={styles.reportCols}>
            {/* Donut chart — CSS-only */}
            <div className={styles.chartCard}>
              <h3 className={styles.cardTitle}>Transaction Summary</h3>
              <div className={styles.chartWrap}>
                <div className={styles.donut}>
                  <div className={styles.donutHole}>
                    <span className={styles.donutTotal}>{data.total_transactions}</span>
                    <span className={styles.donutLabel}>Total</span>
                  </div>
                </div>
                <div className={styles.legend}>
                  {data.service_breakdown?.map((item, i) => (
                    <div key={item.name} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: COLORS[i] }} />
                      <span className={styles.legendName}>{item.name}</span>
                      <span className={styles.legendPct}>{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className={styles.recentCard}>
              <h3 className={styles.cardTitle}>Recent Transactions</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student</th>
                      <th>Service</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_transactions?.length === 0 ? (
                      <tr><td colSpan="6" className={styles.empty}>No transactions in this range</td></tr>
                    ) : (
                      data.recent_transactions?.map((tx, i) => (
                        <tr key={tx.id || i}>
                          <td><span className={styles.qNum}>{tx.student_number || '—'}</span></td>
                          <td className={styles.studentName}>{tx.student_name}</td>
                          <td className={styles.service}>{tx.service}</td>
                          <td className={styles.amount}>₱{Number(tx.amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                          <td>
                            <span className={`${styles.badge} ${styles[tx.status] || styles.pending}`}>
                              {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : '—'}
                            </span>
                          </td>
                          <td className={styles.time}>
                            {tx.created_at
                              ? new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                              : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
