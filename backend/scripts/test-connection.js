const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`   URI: ${process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@') || 'Not set'}`);

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port || 'N/A'}`);

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.length > 0) {
      console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
    } else {
      console.log('   Collections: (none yet - will be created on first use)');
    }

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error(`   ${error.message}`);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check if MongoDB is running');
    console.error('   2. Verify MONGODB_URI in .env file');
    console.error('   3. For Atlas: Check IP whitelist and credentials');
    console.error('   4. See DATABASE_SETUP.md for detailed instructions');
    process.exit(1);
  }
}

testConnection();

