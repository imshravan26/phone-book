import express from "express";
import cors from "cors";
import { HTTP_STATUS, ERROR_MESSAGES } from "./constants.js";

const app = express();

// CORS Middleware with robust origin handling
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = [...defaultOrigins, ...envOrigins];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser or same-origin requests with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// Handle preflight requests across all routes
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Server is running smoothly!",
    timestamp: new Date().toISOString(),
  });
});

// Routes
import userRoutes from "./routes/user.routes.js";
import contactRoutes from "./routes/contact.routes.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/contacts", contactRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || ERROR_MESSAGES.INTERNAL_ERROR;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: "Route not found",
  });
});

export { app };
