require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const connectDB = require('./src/config/db');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const quoteRoutes = require('./src/routes/quoteRoutes');
const enquiryRoutes = require('./src/routes/enquiryRoutes');
const authRoutes = require('./src/routes/authRoutes');
const cmsRoutes = require('./src/routes/cmsRoutes');

const app = express();

// Security & parsing
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://crystalltld.com"
    ],
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, service: 'crystal-express-api', status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/cms', cmsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] Crystal Express API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
});

module.exports = app;
