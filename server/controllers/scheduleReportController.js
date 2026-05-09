const db = require('../models/db');

// Schedule controller
exports.getTodaySchedules = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await db.query('SELECT * FROM schedules WHERE date = ? ORDER BY start_time ASC', [today]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  const { label, start_time, end_time, date, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO schedules (label, start_time, end_time, date, status) VALUES (?, ?, ?, ?, ?)',
      [label, start_time, end_time, date, status || 'active']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Report controller
exports.getReportSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const from = start_date || new Date().toISOString().split('T')[0];
    const to = end_date || from;

    const [[{ total }]] = await db.query("SELECT COUNT(*) as total FROM payment_verifications WHERE DATE(submitted_at) BETWEEN ? AND ?", [from, to]);
    const [[{ amount }]] = await db.query("SELECT COALESCE(SUM(amount),0) as amount FROM payment_verifications WHERE DATE(submitted_at) BETWEEN ? AND ? AND status='verified'", [from, to]);
    const [[{ tuition }]] = await db.query("SELECT COUNT(*) as tuition FROM payment_verifications WHERE DATE(submitted_at) BETWEEN ? AND ? AND service_type='Tuition Payment'", [from, to]);
    const [[{ misc }]] = await db.query("SELECT COUNT(*) as misc FROM payment_verifications WHERE DATE(submitted_at) BETWEEN ? AND ? AND service_type='Miscellaneous Fee'", [from, to]);
    const [[{ clearance }]] = await db.query("SELECT COUNT(*) as clearance FROM payment_verifications WHERE DATE(submitted_at) BETWEEN ? AND ? AND service_type='Clearance'", [from, to]);
    const [[{ insurance }]] = await db.query("SELECT COUNT(*) as insurance FROM payment_verifications WHERE DATE(submitted_at) BETWEEN ? AND ? AND service_type='Insurance'", [from, to]);
    const [[{ other_count }]] = await db.query("SELECT COUNT(*) as other_count FROM payment_verifications WHERE DATE(submitted_at) BETWEEN ? AND ? AND service_type NOT IN ('Tuition Payment','Miscellaneous Fee','Clearance','Insurance')", [from, to]);

    const [recent] = await db.query(
  `SELECT
     pv.id,
     pv.student_name,
     pv.service_type  AS service,
     pv.amount,
     pv.status,
     pv.submitted_at  AS created_at,
     pv.reference_number,
     pv.payment_method,
     s.student_id     AS student_number
   FROM payment_verifications pv
   LEFT JOIN students s ON s.id = pv.student_id
   WHERE DATE(pv.submitted_at) BETWEEN ? AND ?
   ORDER BY pv.submitted_at DESC LIMIT 10`,
  [from, to]
);

    res.json({
      total_transactions: parseInt(total),
      total_amount: parseFloat(amount),
      tuition_payments: parseInt(tuition),
      misc_fees: parseInt(misc),
      clearance: parseInt(clearance),
      insurance: parseInt(insurance),
      other: parseInt(other_count),
      recent_transactions: recent,
      service_breakdown: [
        { name: 'Tuition Payment', value: parseInt(tuition), color: '#6366f1', percent: total > 0 ? Math.round(parseInt(tuition)/parseInt(total)*100) : 0 },
        { name: 'Miscellaneous Fee', value: parseInt(misc), color: '#3b82f6', percent: total > 0 ? Math.round(parseInt(misc)/parseInt(total)*100) : 0 },
        { name: 'Clearance', value: parseInt(clearance), color: '#f59e0b', percent: total > 0 ? Math.round(parseInt(clearance)/parseInt(total)*100) : 0 },
        { name: 'Insurance', value: parseInt(insurance), color: '#ef4444', percent: total > 0 ? Math.round(parseInt(insurance)/parseInt(total)*100) : 0 },
        { name: 'Other', value: parseInt(other_count), color: '#8b5cf6', percent: total > 0 ? Math.round(parseInt(other_count)/parseInt(total)*100) : 0 },
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  const { label, start_time, end_time, status } = req.body;
  try {
    await db.query(
      'UPDATE schedules SET label=?, start_time=?, end_time=?, status=? WHERE id=?',
      [label, start_time, end_time, status, req.params.id]
    );
    res.json({ message: 'Schedule updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await db.query('DELETE FROM schedules WHERE id=?', [req.params.id]);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};