require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const env = require('../config/env');
const User = require('../modules/user/user.model');
const { ROLES } = require('../config/constants');

const seedSuperAdmin = async () => {
  await mongoose.connect(env.mongoUri);

  const existing = await User.findOne({ role: ROLES.SUPER_ADMIN });
  if (existing) {
    console.log('⚠️  Super admin already exists:', existing.email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);

  const superAdmin = await User.create({
    name: 'Platform Owner',
    email: 'superadmin@platform.com',
    password: hashedPassword,
    role: ROLES.SUPER_ADMIN,
    instituteId: null, // super_admin belongs to no single tenant
  });

  console.log('✅ Super admin created:', superAdmin.email, '| password: SuperAdmin@123');
  process.exit(0);
};

seedSuperAdmin().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});