const db = require('../models/db');

exports.getAllReservations = async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = `
      SELECT q.*, s.student_id as student_number, s.course, s.year_section, s.email, s.contact_number
      FROM queues q
      LEFT JOIN students s ON q.student_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'all') { query += ' AND q.status = ?'; params.push(status); }
    if (date) { query += ' AND q.date = ?'; params.push(date); }
    query += ' ORDER BY q.id DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM queues WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReservationStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE queues SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTodayReservationCount = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM queues WHERE date = ?', [today]);
    res.json({ count: parseInt(count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
