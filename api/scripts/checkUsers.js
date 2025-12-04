// scripts/checkUsers.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (root)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('Environment check:');
console.log('MONGO:', process.env.MONGO ? 'Set ✓' : 'Not set ✗');
console.log('Current directory:', __dirname);

async function checkUsers() {
  try {
    if (!process.env.MONGO) {
      console.error('❌ MONGO environment variable is not set!');
      return;
    }

    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Get the database and collection
    const db = mongoose.connection.db;
    console.log('Database name:', db.databaseName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Check users collection
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`\nFound ${users.length} users in database:`);
    console.log('=========================================');
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`ID: ${user._id}`);
      console.log(`Email: ${user.email || 'No email'}`);
      console.log(`Name: ${user.name || 'No name'}`);
      console.log(`Status: ${user.status || 'No status'}`);
      console.log(`Created: ${user.createdAt || 'No date'}`);
      console.log(`Active: ${user.isActive !== undefined ? user.isActive : 'Not specified'}`);
    });

    // Check for admin@wehelpsrilanka.com specifically
    const adminUser = await db.collection('users').findOne({ 
      email: 'admin@wehelpsrilanka.com' 
    });
    
    console.log('\n=========================================');
    if (adminUser) {
      console.log('✅ Found admin@wehelpsrilanka.com user');
      console.log('User details:', {
        _id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        status: adminUser.status,
        hasPassword: !!adminUser.password,
        passwordLength: adminUser.password?.length,
        isActive: adminUser.isActive
      });
    } else {
      console.log('❌ admin@wehelpsrilanka.com NOT FOUND');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

checkUsers();