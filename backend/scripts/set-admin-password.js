require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

(async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_NEW_PASSWORD;
  if (!email || !password || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_NEW_PASSWORD (at least 12 characters, at most 72 UTF-8 bytes).');
  }
  const [result] = await pool.execute(
    "UPDATE users SET password = ? WHERE email = ? AND role = 'admin'",
    [await bcrypt.hash(password, 12), email]
  );
  if (result.affectedRows !== 1) throw new Error('Exactly one existing admin account must match ADMIN_EMAIL.');
  console.log('Admin password updated. Rotate JWT_SECRET to invalidate existing sessions.');
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
