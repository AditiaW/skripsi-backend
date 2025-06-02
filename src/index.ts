import 'dotenv/config'
import express from 'express';
import cookieParser from 'cookie-parser';
import routes from "./routes";
import compression from 'compression';
import cors from 'cors';
import rateLimit from "express-rate-limit";

const app = express();
const port = process.env.PORT
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100, 
  message: "Too many requests, please try again later.",
});

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
}))

app.use(compression())
app.use(cookieParser())
app.use(express.json())
app.use(limiter);

app.use('/', routes)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})