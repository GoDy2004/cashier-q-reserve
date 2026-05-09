const db = require('../models/db');
const bcrypt = require('bcryptjs');

exports.getStudentProfile = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, full_name, student_id, course, year_section, contact_number, email, created_at FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStudentProfile = async (req, res) => {
  const { full_name, course, year_section, contact_number, email } = req.body;
  try {
    await db.query(
      'UPDATE students SET full_name=?, course=?, year_section=?, contact_number=?, email=? WHERE id=?',
      [full_name, course, year_section, contact_number, email, req.params.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ error: 'Both current and new password are required' });
  if (new_password.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters' });

  try {
    const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const valid = await bcrypt.compare(current_password, rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE students SET password = ? WHERE id = ?', [hashed, req.params.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM transactions WHERE student_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};