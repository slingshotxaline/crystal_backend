require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const https = require("https");
const dns = require("dns").promises;
const net = require("net");

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

/* =========================================================
   SECURITY
========================================================= */

app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://crystalltd.com"],
    credentials: true,
  }),
);

/* =========================================================
   BODY PARSING
========================================================= */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   SANITIZATION
========================================================= */

app.use(mongoSanitize());
app.use(xss());

/* =========================================================
   LOGGING
========================================================= */

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

/* =========================================================
   API RATE LIMITER
========================================================= */

app.use("/api", apiLimiter);

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "crystal-express-api",
    status: "online",
  });
});

/* =========================================================
   HEALTH ROUTE
========================================================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "crystal-express-api",
    status: "ok",
    time: new Date().toISOString(),
  });
});

/* =========================================================
   API ROUTES
========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/quotes", quoteRoutes);

app.use("/api/enquiries", enquiryRoutes);

app.use("/api/cms", cmsRoutes);

/* =========================================================
   404 / ERROR HANDLERS
========================================================= */

app.use(notFound);

app.use(errorHandler);

/* =========================================================
   GODADDY OUTBOUND IP TEST
========================================================= */

function testOutboundIP() {
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
}

/* =========================================================
   GENERAL OUTBOUND TCP TEST
   Tests whether Node.js can make a normal
   outbound TCP connection.
========================================================= */

function testGoogleTCP() {
  console.log("[tcp-test] Testing outbound TCP to google.com:443...");

  const socket = net.createConnection({
    host: "google.com",
    port: 443,
    timeout: 5000,
  });

  socket.on("connect", () => {
    console.log("[tcp-test] google.com:443 -> TCP OK");

    socket.destroy();
  });

  socket.on("timeout", () => {
    console.error("[tcp-test] google.com:443 -> TIMEOUT");

    socket.destroy();
  });

  socket.on("error", (err) => {
    console.error("[tcp-test] google.com:443 -> ERROR:", err.message);

    socket.destroy();
  });
}

/* =========================================================
   MONGODB DNS + TCP DIAGNOSTIC
========================================================= */

async function testMongoNetwork() {
  const srvHost = "_mongodb._tcp.cluster0.q5g2xzk.mongodb.net";

  console.log("[mongo-test] Starting MongoDB network diagnostics...");

  console.log("[mongo-test] Resolving SRV:", srvHost);

  try {
    const records = await dns.resolveSrv(srvHost);

    console.log("[mongo-test] SRV records:", records);

    if (!records || records.length === 0) {
      console.error("[mongo-test] No SRV records found.");

      return;
    }

    for (const record of records) {
      await new Promise((resolve) => {
        const hostname = record.name.replace(/\.$/, "");
        const port = record.port;

        console.log(`[mongo-test] Testing TCP: ${hostname}:${port}`);

        const socket = net.createConnection({
          host: hostname,
          port: port,
          timeout: 5000,
        });

        socket.on("connect", () => {
          console.log(`[mongo-test] TCP OK: ${hostname}:${port}`);

          socket.destroy();
          resolve();
        });

        socket.on("timeout", () => {
          console.error(`[mongo-test] TCP TIMEOUT: ${hostname}:${port}`);

          socket.destroy();
          resolve();
        });

        socket.on("error", (err) => {
          console.error(
            `[mongo-test] TCP ERROR: ${hostname}:${port} - ${err.message}`,
          );

          socket.destroy();
          resolve();
        });
      });
    }

    console.log("[mongo-test] MongoDB network diagnostics finished.");
  } catch (err) {
    console.error("[mongo-test] SRV DNS ERROR:", err.message);
  }
}

/* =========================================================
   SERVER
========================================================= */

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", async () => {
  console.log(
    `[server] Crystal Express API running on port ${port} (${process.env.NODE_ENV || "production"})`,
  );

  /* Test normal outbound TCP */
  testGoogleTCP();

  /* Test GoDaddy public IP */
  testOutboundIP();

  /* Test MongoDB DNS + TCP */
  testMongoNetwork();

  /* Connect to MongoDB */
  try {
    await connectDB();
  } catch (err) {
    console.error("[server] Database connection failed:", err.message);
  }
});

/* =========================================================
   EXPORT
========================================================= */

module.exports = app;
