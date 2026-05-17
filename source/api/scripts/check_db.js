import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgresql://postgres.ouupnblegowwupjimmab:unihubworkshop123@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true' });
pool.query("SELECT * FROM users WHERE email='staff@unihub.com'").then(res => {
  console.log(res.rows);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
