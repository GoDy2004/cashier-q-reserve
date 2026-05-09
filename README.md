# Cashier-Q Reserve  —  Setup Guide

## 🔑 Login Credentials

| Role         | Username / ID | Password     |
|--------------|---------------|--------------|
| Admin        | `admin`       | `password`   |
| Cashier      | `cashier_jane`| `password`   |
| Student      | `24229641`    | `student123` |
| Student 2    | `24229642`    | `student123` |

---

## ⚡ Quick Start (3 terminals)

### Terminal 1 — Database
1. Open **MySQL Workbench**
2. Run `database.sql` (File → Open SQL Script → Execute All)

### Terminal 2 — Backend
```bash
cd server
cp .env.example .env
# Edit .env → set DB_PASSWORD to your MySQL root password
npm install
node seed.js       # sets correct bcrypt passwords (run once)
npm run dev        # starts on http://localhost:5000
```

### Terminal 3 — Frontend
```bash
cd client
npm install
npm run dev        # starts on http://localhost:5173
```

Open browser → **http://localhost:5173**

---

## 📁 Project Structure

```
cashier-q/
├── database.sql              ← Run this first in MySQL Workbench
├── server/
│   ├── .env.example
│   ├── seed.js               ← Run once to hash passwords
│   ├── server.js
│   ├── models/
│   │   ├── db.js
│   │   └── authMiddleware.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── queueController.js
│   │   ├── reservationController.js
│   │   ├── transactionController.js
│   │   ├── verificationController.js
│   │   ├── scheduleReportController.js
│   │   └── studentController.js
│   └── routes/
│       ├── auth.js
│       ├── queue.js
│       ├── reservation.js
│       ├── transaction.js
│       ├── verification.js
│       ├── schedule.js
│       ├── report.js
│       └── student.js
└── client/
    └── src/
        ├── App.jsx
        ├── contexts/AuthContext.jsx
        ├── services/api.js
        ├── components/
        │   ├── Button.jsx
        │   └── QueueCard.jsx
        └── pages/
            ├── student/
            │   ├── StudentLogin.jsx     ← Register + Login + Logout
            │   ├── StudentLayout.jsx    ← Bottom nav
            │   ├── StudentHome.jsx      ← Dashboard
            │   ├── StudentQueue.jsx     ← Queue monitor
            │   ├── StudentReserve.jsx   ← 3-step reservation
            │   ├── StudentTransaction.jsx ← Pay + track
            │   ├── StudentHistory.jsx   ← History
            │   └── StudentProfile.jsx   ← Profile + Logout
            └── admin/
                ├── RoleSelect.jsx       ← Cashier / Admin choice
                ├── AdminLogin.jsx       ← Staff login
                ├── AdminLayout.jsx      ← Sidebar + Logout
                ├── AdminDashboard.jsx
                ├── AdminQueueMonitor.jsx
                ├── AdminReservations.jsx
                ├── AdminTransactions.jsx
                ├── AdminVerification.jsx
                └── AdminReports.jsx
```

---

## 🔗 API Endpoints

| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | /api/auth/login             | Staff login          |
| POST   | /api/auth/student/login     | Student login        |
| POST   | /api/auth/student/register  | Student register     |
| GET    | /api/queue                  | Get all queues       |
| GET    | /api/queue/stats            | Queue statistics     |
| POST   | /api/queue                  | Create queue number  |
| PUT    | /api/queue/next             | Call next            |
| PUT    | /api/queue/skip/:id         | Skip queue           |
| DELETE | /api/queue/reset            | Reset queue          |
| GET    | /api/reservations           | Get all reservations |
| GET    | /api/transactions           | Get transactions     |
| POST   | /api/transactions           | Create transaction   |
| GET    | /api/verifications          | Get verifications    |
| PUT    | /api/verifications/:id/verify | Verify payment     |
| PUT    | /api/verifications/:id/reject | Reject payment     |
| POST   | /api/verifications          | Submit verification  |
| GET    | /api/reports/summary        | Report summary       |
| GET    | /api/schedules              | Today's schedule     |

---

## 🔄 Real-time Updates
Both Student and Admin UIs **auto-poll every 6–10 seconds** — no manual refresh needed.

---

## 🧪 Testing Flow

1. **Student registers** → `/login` → Register tab
2. **Student reserves slot** → Home → Reserve Slot → 3-step wizard
3. **Student submits payment** → Home → Transactions → Submit New Payment
4. **Cashier logs in** → `/admin` → Continue as Cashier
5. **Cashier sees queue** → Queue Monitor → Call Next
6. **Cashier verifies payment** → Payment Verification → Verify Payment
7. **Admin sees reports** → `/admin` → Continue as Admin → Reports
