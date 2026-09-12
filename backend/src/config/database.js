const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('[Database Error] MONGO_URI is missing. Add your MongoDB Atlas connection string to backend/.env');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB Connected successfully to ${mongoURI.replace(/:([^@]+)@/, ':*****@')}`);
    return true;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB (${error.message}).`);
    process.exit(1);
  }
};

const getDBState = () => ({
  isConnected: mongoose.connection.readyState === 1
});

module.exports = { connectDB, getDBState };
