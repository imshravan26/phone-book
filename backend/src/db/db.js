import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  try {
    const connectionInstance = await mongoose.connect(uri);
    isConnected = connectionInstance.connection.readyState === 1;
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error", error);
    // In serverless, don't exit; let the request fail and be logged
    throw error;
  }
};

export default connectDB;
