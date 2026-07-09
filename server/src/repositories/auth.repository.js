import pool from '../config/db.js';

/**
 * Fetch a user record by email address.
 * Returns the full row including password_hash so the service can compare it.
 */
export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] ?? null;
};
