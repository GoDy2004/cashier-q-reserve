const db = require('../models/db');

// GET all queues (today)
exports.getAllQueues = async (req, res) => {
  try {
    const { date, status } = req.query;
    let query = 'SELECT * FROM queues WHERE date = ?';
    const params = [date || new Date().toISOString().split('T')[0]];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY id ASC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET queue stats
exports.getQueueStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM queues WHERE date = ?', [today]);
    const [[{ waiting }]] = await db.query("SELECT COUNT(*) as waiting FROM queues WHERE date = ? AND status = 'waiting'", [today]);
    const [[{ serving }]] = await db.query("SELECT COUNT(*) as serving FROM queues WHERE date = ? AND status = 'serving'", [today]);
    const [[{ done }]] = await db.query("SELECT COUNT(*) as done FROM queues WHERE date = ? AND status = 'done'", [today]);

    const [servingRow] = await db.query(
      "SELECT * FROM queues WHERE date = ? AND status = 'serving' ORDER BY id DESC LIMIT 1", [today]
    );
    const [nextRow] = await db.query(
      "SELECT * FROM queues WHERE date = ? AND status = 'waiting' ORDER BY id ASC LIMIT 1", [today]
    );

    res.json({
      total: parseInt(total),
      waiting: parseInt(waiting),
      serving: parseInt(serving),
      done: parseInt(done),
      now_serving: servingRow[0] || null,
      next_in_line: nextRow[0] || null,
      avg_wait_time: 15,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create queue number
exports.createQueue = async (req, res) => {
  const { student_name, service, branch, date, time_slot, student_id } = req.body;
  if (!student_name || !service || !date || !time_slot)
    return res.status(400).json({ error: 'Required fields missing' });

  try {
    const today = date || new Date().toISOString().split('T')[0];
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM queues WHERE date = ?', [today]);
    const num = parseInt(count) + 1;
    const queue_number = `Q-${String(num).padStart(3, '0')}`;

    const [result] = await db.query(
      'INSERT INTO queues (queue_number, student_id, student_name, service, branch, date, time_slot, status) VALUES (?, ?, ?, ?, ?, ?, ?, "waiting")',
      [queue_number, student_id || null, student_name, service, branch || 'Main Campus', today, time_slot]
    );

    // Generate reference number and create a pending transaction
    const prefix = service.split(' ').map(w => w[0]).join('').toUpperCase();
    const reference_number = `${prefix}-${new Date().getFullYear()}-${String(result.insertId).padStart(5, '0')}`;

    await db.query(
      'INSERT INTO transactions (queue_id, student_id, student_name, service, amount, status, date, reference_number) VALUES (?, ?, ?, ?, 0.00, "pending", ?, ?)',
      [result.insertId, student_id || null, student_name, service, today, reference_number]
    );

    const [rows] = await db.query('SELECT * FROM queues WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...rows[0], reference_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT call next
exports.callNext = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    await db.query(
      "UPDATE queues SET status = 'done' WHERE date = ? AND status = 'serving'",
      [today]
    );

    const [nextRows] = await db.query(
      "SELECT * FROM queues WHERE date = ? AND status = 'waiting' ORDER BY id ASC LIMIT 1",
      [today]
    );

    if (nextRows.length === 0)
      return res.json({ message: 'No more in queue', queue: null });

    await db.query(
      "UPDATE queues SET status = 'serving' WHERE id = ?",
      [nextRows[0].id]
    );

    const [updated] = await db.query('SELECT * FROM queues WHERE id = ?', [nextRows[0].id]);
    res.json({ message: 'Next called', queue: updated[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT mark a specific queue as done and update linked transaction to completed
exports.markDone = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE queues SET status = 'done' WHERE id = ?", [id]);

    // Also update the linked transaction to 'completed'
    await db.query(
      "UPDATE transactions SET status = 'completed', time_processed = CURTIME() WHERE queue_id = ? AND status IN ('pending', 'verified')",
      [id]
    );

    res.json({ message: 'Queue marked as done' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT skip
exports.skipQueue = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE queues SET status = 'skipped' WHERE id = ?", [id]);
    res.json({ message: 'Queue skipped' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE reset queue
exports.resetQueue = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await db.query(
      "UPDATE queues SET status = 'cancelled' WHERE date = ? AND status IN ('waiting', 'serving')",
      [today]
    );
    res.json({ message: 'Queue reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT cancel a specific queue
exports.cancelQueue = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE queues SET status = 'cancelled' WHERE id = ?", [id]);
    res.json({ message: 'Queue cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET student's queues
exports.getStudentQueues = async (req, res) => {
  const { student_id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM queues WHERE student_id = ? ORDER BY created_at DESC',
      [student_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};