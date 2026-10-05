const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not set");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `[db] MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`,
    );

    return true;
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);

    return false;
  }
};

module.exports = connectDB;
