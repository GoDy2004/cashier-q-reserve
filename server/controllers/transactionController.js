const db = require('../models/db');

exports.getAllTransactions = async (req, res) => {
  try {
    const { student_id, status } = req.query;
    // Only return transactions that came from student payment submissions
    // (those linked to a payment_verification entry via reference_number)
    let query = `
      SELECT t.*, q.queue_number,
             s.student_id AS student_number
      FROM transactions t
      LEFT JOIN queues q ON t.queue_id = q.id
      LEFT JOIN students s ON t.student_id = s.id
      WHERE t.reference_number IS NOT NULL
        AND t.reference_number != ''
    `;
    const params = [];
    if (student_id) { query += ' AND t.student_id = ?'; params.push(student_id); }
    if (status)     { query += ' AND t.status = ?';     params.push(status); }
    query += ' ORDER BY t.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactionStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Only count transactions that came from student payment submissions
    const [[{ total }]]   = await db.query("SELECT COUNT(*) as total FROM transactions WHERE date = ? AND reference_number IS NOT NULL AND reference_number != ''", [today]);
    const [[{ amount }]]  = await db.query("SELECT COALESCE(SUM(amount),0) as amount FROM transactions WHERE date = ? AND status = 'completed' AND reference_number IS NOT NULL AND reference_number != ''", [today]);
    const [[{ tuition }]] = await db.query("SELECT COUNT(*) as tuition FROM transactions WHERE date = ? AND service = 'Tuition Payment' AND reference_number IS NOT NULL AND reference_number != ''", [today]);
    const [[{ other }]]   = await db.query("SELECT COUNT(*) as other FROM transactions WHERE date = ? AND service != 'Tuition Payment' AND reference_number IS NOT NULL AND reference_number != ''", [today]);
    res.json({ total_transactions: parseInt(total), total_amount: parseFloat(amount), tuition_payments: parseInt(tuition), other_payments: parseInt(other) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  const { queue_id, student_id, student_name, service, amount, status, date, reference_number, payment_method } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO transactions (queue_id, student_id, student_name, service, amount, status, date, time_processed, reference_number, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, CURTIME(), ?, ?)',
      [queue_id, student_id, student_name, service, amount || 0, status || 'pending', date || new Date().toISOString().split('T')[0], reference_number, payment_method]
    );
    const [rows] = await db.query(
      'SELECT t.*, q.queue_number FROM transactions t LEFT JOIN queues q ON t.queue_id = q.id WHERE t.id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  const { status, amount, payment_method } = req.body;
  try {
    await db.query(
      'UPDATE transactions SET status=?, amount=?, payment_method=?, time_processed=CURTIME() WHERE id=?',
      [status, amount, payment_method, req.params.id]
    );
    const [rows] = await db.query(
      'SELECT t.*, q.queue_number FROM transactions t LEFT JOIN queues q ON t.queue_id = q.id WHERE t.id = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await db.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};