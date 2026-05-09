-- ============================================================
--  Cashier-Q Reserve  ·  Full Database Setup
--  Run this file in MySQL Workbench before starting the server
-- ============================================================

CREATE DATABASE IF NOT EXISTS queue_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE queue_system;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS payment_verifications;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS queues;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Staff users
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(100)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  full_name  VARCHAR(150),
  role       ENUM('cashier','admin') DEFAULT 'cashier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students
CREATE TABLE students (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  full_name      VARCHAR(150) NOT NULL,
  student_id     VARCHAR(50)  NOT NULL UNIQUE,
  course         VARCHAR(100),
  year_section   VARCHAR(50),
  contact_number VARCHAR(20),
  email          VARCHAR(150),
  password       VARCHAR(255) NOT NULL,
  avatar_url     VARCHAR(255),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Queues
CREATE TABLE queues (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  queue_number VARCHAR(10)  NOT NULL,
  student_id   INT,
  student_name VARCHAR(150),
  service      VARCHAR(100),
  branch       VARCHAR(100) DEFAULT 'Main Campus',
  date         DATE         NOT NULL,
  time_slot    VARCHAR(50),
  status       ENUM('waiting','serving','done','skipped','cancelled') DEFAULT 'waiting',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

-- 4. Transactions
CREATE TABLE transactions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  queue_id         INT,
  student_id       INT,
  student_name     VARCHAR(150),
  service          VARCHAR(100),
  amount           DECIMAL(10,2) DEFAULT 0.00,
  status           ENUM('completed','pending','cancelled','verified') DEFAULT 'pending',
  date             DATE,
  time_processed   TIME,
  reference_number VARCHAR(100),
  payment_method   VARCHAR(50),
  receipt_url      VARCHAR(255),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (queue_id)   REFERENCES queues(id)   ON DELETE SET NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

-- 5. Payment verifications
CREATE TABLE payment_verifications (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id   INT,
  student_id       INT,
  student_name     VARCHAR(150),
  reference_number VARCHAR(100),
  payment_method   VARCHAR(100),
  amount           DECIMAL(10,2),
  service_type     VARCHAR(100),
  contact_number   VARCHAR(20),
  email            VARCHAR(150),
  attachment_url   VARCHAR(255),
  status           ENUM('pending','verified','rejected') DEFAULT 'pending',
  submitted_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at      TIMESTAMP NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
  FOREIGN KEY (student_id)     REFERENCES students(id)     ON DELETE SET NULL
);

-- 6. Schedules
CREATE TABLE schedules (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  label      VARCHAR(100) NOT NULL,
  start_time TIME         NOT NULL,
  end_time   TIME         NOT NULL,
  date       DATE         NOT NULL,
  status     ENUM('active','break','done') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  SEED DATA
--  Staff password   : "password"
--  Student password : "student123"
--  Hashes generated with bcrypt rounds=10
-- ============================================================

-- Staff  (password = "password")
INSERT INTO users (username, password, full_name, role) VALUES
('admin',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Admin User', 'admin'),
('cashier_jane',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Cashier Jane', 'cashier'),
('cashier_bob',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Cashier Bob', 'cashier');

-- Students  (password = "student123")
INSERT INTO students
  (full_name, student_id, course, year_section, contact_number, email, password)
VALUES
('Prencis Jane R. Templo', '24229641', 'BSIT', '3-F',
 '0917 123 4567', 'prencistempl01@gmail.com',
 '$2b$10$TwkMQVRJRSTh6KS3kFr.beVlIV9d5tYRhcH1lfMOaFjgMqJfBLQqG'),
('Juan Miguel Dela Cruz', '24229642', 'BSCS', '2-A',
 '0918 234 5678', 'jmdelacruz@gmail.com',
 '$2b$10$TwkMQVRJRSTh6KS3kFr.beVlIV9d5tYRhcH1lfMOaFjgMqJfBLQqG');

-- Schedules (today)
INSERT INTO schedules (label, start_time, end_time, date, status) VALUES
('Morning Session',   '08:00:00', '12:00:00', CURDATE(), 'active'),
('Afternoon Session', '13:00:00', '17:00:00', CURDATE(), 'active'),
('Break',             '17:00:00', '18:00:00', CURDATE(), 'break');

-- Queues (today)
INSERT INTO queues
  (queue_number, student_id, student_name, service, branch, date, time_slot, status)
VALUES
('Q-025', 1, 'Prencis Jane R. Templo', 'Tuition Payment',    'Main Campus', CURDATE(), '2:00 PM - 3:00 PM', 'serving'),
('Q-026', 2, 'Juan Miguel Dela Cruz',  'Tuition Payment',    'Main Campus', CURDATE(), '2:30 PM - 3:30 PM', 'waiting'),
('Q-027', NULL, 'Maria Angela Santos', 'Miscellaneous Fee',  'Main Campus', CURDATE(), '2:40 PM - 3:40 PM', 'waiting'),
('Q-028', NULL, 'Christian Paul Reyes','Clearance',          'Main Campus', CURDATE(), '2:50 PM - 3:50 PM', 'waiting'),
('Q-029', NULL, 'Alyssa Mae Villanueva','Tuition Payment',   'Main Campus', CURDATE(), '3:00 PM - 4:00 PM', 'waiting'),
('Q-030', NULL, 'Kyle Andrew Garcia',  'Insurance',          'Main Campus', CURDATE(), '3:10 PM - 4:10 PM', 'waiting');

-- Transactions for student 1
INSERT INTO transactions
  (student_id, student_name, service, amount, status, date, time_processed, reference_number, payment_method)
VALUES
(1,'Prencis Jane R. Templo','Tuition Payment',  25500.00,'completed',DATE_SUB(CURDATE(),INTERVAL 6 DAY),'14:05:00','TUT-2025-00001','Online Banking'),
(1,'Prencis Jane R. Templo','Miscellaneous Fee', 3500.00,'completed',DATE_SUB(CURDATE(),INTERVAL 6 DAY),'13:35:00','MISC-2025-00001','GCash'),
(1,'Prencis Jane R. Templo','Receipt Reissuance', 450.00,'completed',DATE_SUB(CURDATE(),INTERVAL 6 DAY),'10:20:00','REC-2025-00001','Cash'),
(1,'Prencis Jane R. Templo','Payment Verification',0.00, 'verified', DATE_SUB(CURDATE(),INTERVAL 13 DAY),'15:10:00','VER-2025-00001','Online Banking'),
(1,'Prencis Jane R. Templo','Tuition Payment',     0.00, 'cancelled',DATE_SUB(CURDATE(),INTERVAL 14 DAY),'09:15:00','TUT-2025-00002','GCash');

-- Payment verifications
INSERT INTO payment_verifications
  (student_id, student_name, reference_number, payment_method, amount, service_type, contact_number, email, status)
VALUES
(1,'Prencis Jane R. Templo','TUT-2025-00003','Online Banking',25500.00,'Tuition Payment',  '0917 123 4567','prencistempl01@gmail.com','pending'),
(2,'Juan Miguel Dela Cruz', 'MISC-2025-00099','GCash',        3500.00,'Miscellaneous Fee','0918 234 5678','jmdelacruz@gmail.com',   'pending'),
(1,'Prencis Jane R. Templo','TUT-2025-00001','Online Banking',25500.00,'Tuition Payment',  '0917 123 4567','prencistempl01@gmail.com','verified');

-- Verify row counts
SELECT 'users'               AS tbl, COUNT(*) cnt FROM users
UNION ALL SELECT 'students',          COUNT(*) FROM students
UNION ALL SELECT 'queues',            COUNT(*) FROM queues
UNION ALL SELECT 'transactions',      COUNT(*) FROM transactions
UNION ALL SELECT 'payment_verif.',    COUNT(*) FROM payment_verifications
UNION ALL SELECT 'schedules',         COUNT(*) FROM schedules;
