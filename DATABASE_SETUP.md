# Database Setup Documentation

This document provides comprehensive instructions for setting up MongoDB database for the Pet Adoption Management System.

## Table of Contents
1. [MongoDB Installation](#mongodb-installation)
2. [Database Configuration](#database-configuration)
3. [Connection Setup](#connection-setup)
4. [Database Schema](#database-schema)
5. [Initial Setup](#initial-setup)
6. [Troubleshooting](#troubleshooting)

---

## MongoDB Installation

### Option 1: Local MongoDB Installation

#### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service (recommended)
5. Install MongoDB Compass (GUI tool) - optional but recommended

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (Free tier available)
4. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
5. Whitelist your IP address:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your specific IP
6. Get connection string:
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (it will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

---

## Database Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/petAdoptionDB

# For MongoDB Atlas (replace with your actual connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/petAdoptionDB?retryWrites=true&w=majority

# JWT Secret (change this to a random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
```

### Connection String Format

#### Local MongoDB
```
mongodb://localhost:27017/petAdoptionDB
```
- `localhost` - MongoDB host
- `27017` - Default MongoDB port
- `petAdoptionDB` - Database name

#### MongoDB Atlas
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/petAdoptionDB?retryWrites=true&w=majority
```
- Replace `<username>` with your MongoDB Atlas username
- Replace `<password>` with your MongoDB Atlas password
- Replace `cluster0.xxxxx` with your cluster name
- `petAdoptionDB` - Database name (will be created automatically)

---

## Connection Setup

### Verify MongoDB is Running

#### Windows
```bash
# Check if MongoDB service is running
sc query MongoDB

# Or check in Services (services.msc)
```

#### macOS/Linux
```bash
# Check MongoDB status
brew services list  # macOS
# or
sudo systemctl status mongod  # Linux

# Test connection
mongosh  # or mongo (older versions)
```

### Test Connection from Application

The backend server will automatically connect to MongoDB when started. Check the console for:
```
MongoDB Connected
```

If you see an error, check:
1. MongoDB is running
2. Connection string in `.env` is correct
3. Firewall allows connection on port 27017 (local) or port 27017 (Atlas)

---

## Database Schema

The application uses three main collections:

### 1. Users Collection

**Collection Name:** `users`

**Schema:**
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  phone: String (optional),
  address: String (optional),
  role: String (enum: ['adopter', 'admin'], default: 'adopter'),
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `email` - Unique index

### 2. Pets Collection

**Collection Name:** `pets`

**Schema:**
```javascript
{
  name: String (required),
  species: String (required, enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']),
  breed: String (optional),
  age: Number (required, min: 0),
  gender: String (required, enum: ['Male', 'Female', 'Unknown']),
  size: String (required, enum: ['Small', 'Medium', 'Large']),
  color: String (optional),
  description: String (required),
  image: String (optional, default: ''),
  status: String (enum: ['Available', 'Pending', 'Adopted'], default: 'Available'),
  location: String (optional),
  medicalHistory: String (optional),
  specialNeeds: String (optional),
  createdBy: ObjectId (reference to User),
  createdAt: Date (default: Date.now),
  adoptedAt: Date (optional)
}
```

**Indexes:**
- `createdBy` - Index for faster queries
- `status` - Index for filtering
- `species` - Index for filtering

### 3. Applications Collection

**Collection Name:** `applications`

**Schema:**
```javascript
{
  pet: ObjectId (required, reference to Pet),
  applicant: ObjectId (required, reference to User),
  status: String (enum: ['Pending', 'Approved', 'Rejected', 'Withdrawn'], default: 'Pending'),
  applicationDate: Date (default: Date.now),
  message: String (required),
  livingSituation: String (required),
  experience: String (required),
  reviewedBy: ObjectId (optional, reference to User),
  reviewedAt: Date (optional),
  reviewNotes: String (optional)
}
```

**Indexes:**
- `pet` - Index for faster queries
- `applicant` - Index for faster queries
- `status` - Index for filtering

---

## Initial Setup

### Step 1: Create .env File

1. Navigate to `backend` directory
2. Create a `.env` file (copy from `.env.example` if available)
3. Add your MongoDB connection string and JWT secret

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

### Step 3: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### Step 4: Verify Database Connection

When the server starts, you should see:
```
MongoDB Connected
Server running on port 5000
```

### Step 5: Create Admin User

After registering a user through the application, you can make them an admin using one of these methods:

#### Method 1: Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `petAdoptionDB` > `users` collection
4. Find your user document
5. Edit the document and change `role` from `"adopter"` to `"admin"`

#### Method 2: Using MongoDB Shell (mongosh)
```javascript
// Connect to MongoDB
mongosh

// Switch to database
use petAdoptionDB

// Update user role
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

#### Method 3: Using Node.js Script

Create a file `backend/scripts/createAdmin.js`:

```javascript
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = process.argv[2];
    if (!email) {
      console.log('Usage: node createAdmin.js <email>');
      process.exit(1);
    }

    const user = await User.findOneAndUpdate(
      { email: email },
      { $set: { role: 'admin' } },
      { new: true }
    );

    if (user) {
      console.log(`User ${email} is now an admin`);
    } else {
      console.log(`User with email ${email} not found`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
```

Run it:
```bash
node scripts/createAdmin.js your-email@example.com
```

---

## Database Operations

### Viewing Data

#### Using MongoDB Compass
1. Connect to your MongoDB instance
2. Browse collections: `users`, `pets`, `applications`
3. View, edit, and delete documents

#### Using MongoDB Shell
```javascript
// Connect
mongosh

// Use database
use petAdoptionDB

// View all collections
show collections

// View all users
db.users.find().pretty()

// View all pets
db.pets.find().pretty()

// View all applications
db.applications.find().pretty()
```

### Backup Database

#### Using mongodump
```bash
# Local MongoDB
mongodump --db=petAdoptionDB --out=./backup

# MongoDB Atlas
mongodump --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/petAdoptionDB" --out=./backup
```

### Restore Database

#### Using mongorestore
```bash
# Local MongoDB
mongorestore --db=petAdoptionDB ./backup/petAdoptionDB

# MongoDB Atlas
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net" ./backup/petAdoptionDB
```

---

## Troubleshooting

### Common Issues

#### 1. "MongoDB connection error"
**Solution:**
- Verify MongoDB is running: `mongosh` or check services
- Check connection string in `.env`
- For Atlas: Verify IP whitelist and credentials
- Check firewall settings

#### 2. "Authentication failed"
**Solution:**
- Verify username and password in connection string
- Check database user permissions in Atlas
- Ensure user has read/write access

#### 3. "Connection timeout"
**Solution:**
- Check network connectivity
- Verify IP is whitelisted (Atlas)
- Check MongoDB port (27017) is not blocked by firewall

#### 4. "Database not found"
**Solution:**
- MongoDB creates databases automatically on first write
- This is normal - the database will be created when you register the first user

#### 5. "E11000 duplicate key error"
**Solution:**
- This means a unique field (like email) already exists
- Use a different email or delete the existing user

### Connection String Examples

#### Local with Authentication
```
mongodb://username:password@localhost:27017/petAdoptionDB?authSource=admin
```

#### Local without Authentication
```
mongodb://localhost:27017/petAdoptionDB
```

#### MongoDB Atlas
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/petAdoptionDB?retryWrites=true&w=majority
```

#### MongoDB Atlas with Additional Options
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/petAdoptionDB?retryWrites=true&w=majority&ssl=true&authSource=admin
```

### Testing Connection

Create a test file `backend/test-connection.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});
```

Run it:
```bash
node test-connection.js
```

---

## Production Considerations

### Security Best Practices

1. **Use Strong JWT Secret:**
   ```env
   JWT_SECRET=<generate-a-random-64-character-string>
   ```

2. **Use Environment-Specific Databases:**
   - Development: `petAdoptionDB_dev`
   - Production: `petAdoptionDB_prod`

3. **Enable MongoDB Authentication:**
   - Always use username/password for production
   - Use strong passwords
   - Rotate credentials regularly

4. **Network Security:**
   - Whitelist only necessary IPs in Atlas
   - Use VPN for production connections
   - Enable SSL/TLS

5. **Regular Backups:**
   - Set up automated backups
   - Test restore procedures
   - Keep multiple backup copies

### Performance Optimization

1. **Create Indexes:**
   ```javascript
   // In MongoDB shell
   db.users.createIndex({ email: 1 }, { unique: true });
   db.pets.createIndex({ status: 1, species: 1 });
   db.applications.createIndex({ applicant: 1, status: 1 });
   ```

2. **Connection Pooling:**
   - Mongoose handles this automatically
   - Default pool size: 5
   - Adjust in connection options if needed

3. **Query Optimization:**
   - Use `.select()` to limit fields
   - Use `.limit()` and `.skip()` for pagination
   - Use `.lean()` for read-only queries

---

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Compass Guide](https://docs.mongodb.com/compass/current/)

---

## Quick Reference

### Start MongoDB (Local)
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Stop MongoDB (Local)
```bash
# Windows
net stop MongoDB

# macOS
brew services stop mongodb-community

# Linux
sudo systemctl stop mongod
```

### Connect to MongoDB Shell
```bash
mongosh                    # Local default
mongosh "mongodb://localhost:27017"  # Explicit local
mongosh "mongodb+srv://..."  # Atlas connection
```

---

For additional help, refer to the main [README.md](./README.md) file.

