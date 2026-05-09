const db = require('../models/db');

exports.getAllVerifications = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT
        pv.*,
        s.student_id  AS student_id,
        s.course      AS course,
        s.year_section AS year_section
      FROM payment_verifications pv
      LEFT JOIN students s ON s.id = pv.student_id
      WHERE 1=1
    `;
    const params = [];
    if (status) { query += ' AND pv.status = ?'; params.push(status); }
    query += ' ORDER BY pv.submitted_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingCount = async (req, res) => {
  try {
    const [[{ count }]] = await db.query("SELECT COUNT(*) as count FROM payment_verifications WHERE status = 'pending'");
    res.json({ count: parseInt(count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVerificationById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        pv.*,
        s.student_id  AS student_id,
        s.course      AS course,
        s.year_section AS year_section
      FROM payment_verifications pv
      LEFT JOIN students s ON s.id = pv.student_id
      WHERE pv.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    await db.query(
      "UPDATE payment_verifications SET status='verified', verified_at=NOW() WHERE id=?",
      [req.params.id]
    );
    // Sync the linked transaction to 'verified'
    const [rows] = await db.query('SELECT * FROM payment_verifications WHERE id=?', [req.params.id]);
    if (rows[0]?.reference_number) {
      await db.query(
        "UPDATE transactions SET status='verified' WHERE reference_number=?",
        [rows[0].reference_number]
      );
    }
    res.json({ message: 'Payment verified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectPayment = async (req, res) => {
  try {
    await db.query(
      "UPDATE payment_verifications SET status='rejected', verified_at=NOW() WHERE id=?",
      [req.params.id]
    );
    // Sync the linked transaction to 'cancelled'
    const [rows] = await db.query('SELECT * FROM payment_verifications WHERE id=?', [req.params.id]);
    if (rows[0]?.reference_number) {
      await db.query(
        "UPDATE transactions SET status='cancelled' WHERE reference_number=?",
        [rows[0].reference_number]
      );
    }
    res.json({ message: 'Payment rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitVerification = async (req, res) => {
  const { student_id, student_name, reference_number, payment_method, amount, service_type, contact_number, email } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO payment_verifications (student_id, student_name, reference_number, payment_method, amount, service_type, contact_number, email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pending")',
      [student_id, student_name, reference_number, payment_method, amount, service_type, contact_number, email]
    );
    res.status(201).json({ id: result.insertId, message: 'Verification submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};