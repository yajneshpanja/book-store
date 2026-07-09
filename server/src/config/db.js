import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  port:              Number(process.env.DB_PORT) || 3306,
  user:              process.env.DB_USER     || 'root',
  password:          process.env.DB_PASSWORD || 'root',
  database:          process.env.DB_NAME     || 'bookstore_db',
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
  timezone:          'Z',          // store/retrieve dates as UTC
  dateStrings:       true,         // return DATE columns as 'YYYY-MM-DD' strings
});

// Verify connectivity on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });

export default pool;
