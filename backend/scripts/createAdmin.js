const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.argv[2];
    if (!email) {
      console.log('❌ Usage: node scripts/createAdmin.js <email>');
      console.log('Example: node scripts/createAdmin.js admin@example.com');
      process.exit(1);
    }

    const user = await User.findOneAndUpdate(
      { email: email },
      { $set: { role: 'admin' } },
      { new: true }
    );

    if (user) {
      console.log(`✅ User ${email} is now an admin`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
    } else {
      console.log(`❌ User with email ${email} not found`);
      console.log('   Please register the user first through the application');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();

