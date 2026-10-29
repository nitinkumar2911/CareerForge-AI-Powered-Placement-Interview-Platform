const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      try {
        console.log(`Connecting to specified MongoDB instance...`);
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 4000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.warn(`Could not connect to specified MONGO_URI (${err.message}). Falling back to in-memory MongoDB...`);
      }
    }

    // Attempt default local MongoDB
    try {
      const defaultUri = 'mongodb://127.0.0.1:27017/careerforge';
      const conn = await mongoose.connect(defaultUri, {
        serverSelectionTimeoutMS: 2500
      });
      console.log(`Connected to local MongoDB daemon: ${conn.connection.host}`);
      return conn;
    } catch (localErr) {
      console.log('Local MongoDB not running. Initializing embedded in-memory MongoDB server for zero-setup execution...');
    }

    // Fallback: MongoDB In-Memory Server
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'careerforge'
      }
    });
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`MongoDB In-Memory Server started & connected: ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Fatal Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error disconnecting database:', err);
  }
};

module.exports = { connectDB, disconnectDB };
