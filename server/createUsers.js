const bcrypt = require('bcrypt');
const db = require('./config/db');

async function createUsers() {
  const password = 'JJazmart@123';
  const hash = await bcrypt.hash(password, 10);
  
  try {
    await db.query(
      `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      ['user@jjazmart.com', hash, 'Test User', 'user']
    );
    console.log('User created: user@jjazmart.com');
  } catch(e) {
    console.log('User error:', e.message);
  }
  
  try {
    await db.query(
      `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      ['admin@jjazmart.com', hash, 'Admin User', 'admin']
    );
    console.log('Admin created: admin@jjazmart.com');
  } catch(e) {
    console.log('Admin error:', e.message);
  }
  
  process.exit(0);
}

createUsers().catch(e => { console.error(e); process.exit(1); });