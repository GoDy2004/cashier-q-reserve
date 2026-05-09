/**
 * seed.js  –  Run ONCE after database.sql to set correct passwords
 * Usage:  cd server && node seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./models/db');

async function seed() {
  console.log('🌱  Seeding passwords...');

  const staffPass   = await bcrypt.hash('password',    10);
  const studentPass = await bcrypt.hash('student123',  10);

  // Update staff
  await db.query('UPDATE users SET password = ? WHERE username = ?', [staffPass, 'admin']);
  await db.query('UPDATE users SET password = ? WHERE username = ?', [staffPass, 'cashier_jane']);
  await db.query('UPDATE users SET password = ? WHERE username = ?', [staffPass, 'cashier_bob']);

  // Update students
  await db.query('UPDATE students SET password = ? WHERE student_id = ?', [studentPass, '24229641']);
  await db.query('UPDATE students SET password = ? WHERE student_id = ?', [studentPass, '24229642']);

  console.log('✅  Passwords updated successfully.');
  console.log('');
  console.log('  Staff logins:');
  console.log('    admin        /  password');
  console.log('    cashier_jane /  password');
  console.log('');
  console.log('  Student logins:');
  console.log('    24229641  /  student123');
  console.log('    24229642  /  student123');

  process.exit(0);
}

seed().catch(err => { console.error('❌', err); process.exit(1); });
