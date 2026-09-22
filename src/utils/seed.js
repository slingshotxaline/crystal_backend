/**
 * One-off seed script: creates the first admin CMS user.
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function run() {
  await connectDB();

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@crystalexpress.example';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seed] Admin user already exists: ${email}`);
  } else {
    await User.create({ name: 'Crystal Admin', email, password, role: 'admin' });
    console.log(`[seed] Created admin user: ${email} / ${password} — change this password after first login.`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
