// checkConnectionDetails.js
import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://sanjananim2001_db_user:22501Sndnt@wehelpsrilanka.kqnfqsp.mongodb.net/?appName=WeHelpSriLanka";

async function checkConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    
    // Get the database name
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log('Current database name:', dbName);
    
    // List all databases
    console.log('\nListing all databases...');
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();
    
    databases.databases.forEach(db => {
      console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    
    // List collections in current database
    console.log('\nCollections in current database:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check users collection specifically
    if (collections.find(c => c.name === 'users')) {
      console.log('\n✅ "users" collection exists');
      
      // Count documents in users collection
      const usersCount = await db.collection('users').countDocuments();
      console.log(`Documents in users collection: ${usersCount}`);
      
      // Find all users
      const allUsers = await db.collection('users').find({}).toArray();
      console.log('\nAll users:');
      allUsers.forEach(user => {
        console.log(`- ${user.email} (${user.status || 'no status'})`);
      });
      
    } else {
      console.log('\n❌ "users" collection does NOT exist in current database');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkConnection();