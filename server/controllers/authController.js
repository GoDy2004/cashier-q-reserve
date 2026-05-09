const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

// Staff login (cashier/admin)
exports.staffLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Student login
exports.studentLogin = async (req, res) => {
  const { student_id, password } = req.body;
  if (!student_id || !password)
    return res.status(400).json({ error: 'Student ID and password required' });

  try {
    const [rows] = await db.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const student = rows[0];
    const valid = await bcrypt.compare(password, student.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: student.id, student_id: student.student_id, full_name: student.full_name, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      student: {
        id: student.id,
        student_id: student.student_id,
        full_name: student.full_name,
        course: student.course,
        year_section: student.year_section,
        contact_number: student.contact_number,
        email: student.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Student register
exports.studentRegister = async (req, res) => {
  const { full_name, student_id, course, year_section, contact_number, email, password } = req.body;
  if (!full_name || !student_id || !password)
    return res.status(400).json({ error: 'Required fields missing' });

  try {
    const [existing] = await db.query('SELECT id FROM students WHERE student_id = ?', [student_id]);
    if (existing.length > 0)
      return res.status(409).json({ error: 'Student ID already registered' });

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO students (full_name, student_id, course, year_section, contact_number, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, student_id, course, year_section, contact_number, email, hashed]
    );
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
