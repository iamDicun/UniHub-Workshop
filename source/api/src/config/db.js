import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thử load file .env từ thư mục gốc (source/) nếu chạy test/dev ở local
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const { Pool } = pg;

// Tự động build chuỗi connection nếu DATABASE_URL bị mất
const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?pgbouncer=true`;

const pool = new Pool({
  connectionString,
  max: 20, // Mở tối đa 20 connections từ mỗi instance Node.js
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
