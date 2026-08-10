const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes/index');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());

// CORS config — credentials true hone ki wajah se origin '*' nahi chalega,
// isliye specific origin(s) allow kar rahe hain
const allowedOrigins = [
  'http://localhost:5173',
  // CLIENT_URL comma-separated ho sakta hai (jaise: Vercel prod URL + custom domain)
  ...(process.env.CLIENT_URL || '').split(',').map((u) => u.trim()),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// IMPORTANT: Razorpay webhook needs the raw request body (as a Buffer) to
// verify its HMAC signature — this must be registered BEFORE express.json(),
// and only for this specific path, so the rest of the app keeps using
// normal parsed JSON.
app.use('/api/v1/fees/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1', routes);

app.use(errorMiddleware);

module.exports = app;