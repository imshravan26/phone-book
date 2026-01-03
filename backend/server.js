import dotenv from "dotenv";
import connectDB from "./src/db/db.js";
import { app } from "./src/app.js";

// Load environment variables
dotenv.config({ path: "./.env" });

let isConnected = false;
const ensureDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Export the Express app for Vercel Serverless
export default app;
