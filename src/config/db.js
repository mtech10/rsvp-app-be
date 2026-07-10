import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const { MONGO_URI } = process.env;

    if (!MONGO_URI) {
      throw new Error(
        "The MongoDB connection string is not added in environment variables",
      );
    }

    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
