import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const port = process.env.PORT || 5000;

// Rate limiter: max 100 requests per 5 minutes
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});

const rawOrigins = process.env.ORIGIN?.split(',') || [];
const allowedOrigins = rawOrigins.map(origin =>
  origin.trim().replace(/\/$/, '')
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error('Origin tidak diizinkan'));
    }
  },
  credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(limiter);

app.use('/', routes);

// Server Start
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
