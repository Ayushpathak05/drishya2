import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // fail fast if MongoDB unreachable
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });
        console.log('mongodb connected successfully.');
    } catch (error) {
        console.error('MongoDB connection FAILED:', error.message);
        process.exit(1); // crash Render so it shows a clear failure instead of hanging
    }
}
export default connectDB;