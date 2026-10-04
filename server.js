require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const https = require("https");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const connectDB = require("./src/config/db");

const { apiLimiter } = require("./src/middleware/rateLimiter");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const quoteRoutes = require("./src/routes/quoteRoutes");
const enquiryRoutes = require("./src/routes/enquiryRoutes");
const authRoutes = require("./src/routes/authRoutes");
const cmsRoutes = require("./src/routes/cmsRoutes");
const userRoutes = require("./src/routes/userRoutes");

const app = express();

/*
 * ----------------------------------------------------
 * Security & Parsing
 * ----------------------------------------------------
 */

app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://crystalltd.com"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitize());
app.use(xss());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

/*
 * ----------------------------------------------------
 * API Rate Limiter
 * ----------------------------------------------------
 */

app.use("/api", apiLimiter);

/*
 * ----------------------------------------------------
 * Root / Health Check
 * ----------------------------------------------------
 */

// Root route for GoDaddy health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "crystal-express-api",
    status: "online",
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "crystal-express-api",
    status: "ok",
    time: new Date().toISOString(),
  });
});

/*
 * ----------------------------------------------------
 * API Routes
 * ----------------------------------------------------
 */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/cms", cmsRoutes);

/*
 * ----------------------------------------------------
 * Error Handling
 * ----------------------------------------------------
 */

app.use(notFound);
app.use(errorHandler);

/*
 * ----------------------------------------------------
 * GoDaddy Outbound IP Test
 * ----------------------------------------------------
 */

https
  .get("https://api.ipify.org", (res) => {
    let ip = "";

    res.on("data", (chunk) => {
      ip += chunk;
    });

    res.on("end", () => {
      console.log("[network] GoDaddy outbound IP:", ip);
    });
  })
  .on("error", (err) => {
    console.error("[network] IP check failed:", err.message);
  });

/*
 * ----------------------------------------------------
 * Start Server
 * ----------------------------------------------------
 */

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", async () => {
  console.log(
    `[server] Crystal Express API running on port ${port} (${process.env.NODE_ENV || "development"})`,
  );

  try {
    await connectDB();
  } catch (err) {
    console.error("[server] Database connection failed:", err.message);
  }
});

module.exports = app;
