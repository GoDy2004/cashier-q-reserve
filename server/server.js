require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const queueRoutes = require('./routes/queue');
const reservationRoutes = require('./routes/reservation');
const transactionRoutes = require('./routes/transaction');
const verificationRoutes = require('./routes/verification');
const scheduleRoutes = require('./routes/schedule');
const reportRoutes = require('./routes/report');
const studentRoutes = require('./routes/student');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/students', studentRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Cashier-Q API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Cashier-Q Server running on http://localhost:${PORT}`);
});
