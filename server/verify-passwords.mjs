/**
 * verify-passwords.mjs
 * Quick utility: checks that the bcrypt hashes stored in the users table
 * actually match the expected plain-text passwords.
 *
 * Usage:  node verify-passwords.mjs
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from './src/config/db.js';

const checks = [
  { email: 'user@bookstore.com',  plain: 'user1234'  },
  { email: 'admin@bookstore.com', plain: 'admin1234' },
];

const [rows] = await pool.query(
  'SELECT email, password_hash FROM users WHERE email IN (?)',
  [checks.map(c => c.email)]
);

for (const { email, plain } of checks) {
  const row = rows.find(r => r.email === email);
  if (!row) {
    console.error(`❌  ${email}  — user NOT FOUND in database`);
    continue;
  }
  const ok = await bcrypt.compare(plain, row.password_hash);
  console.log(ok
    ? `✅  ${email}  password="${plain}"  → hash matches`
    : `❌  ${email}  password="${plain}"  → HASH MISMATCH  (hash: ${row.password_hash})`
  );
}

await pool.end();
