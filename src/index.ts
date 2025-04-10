import 'dotenv/config'
import express from 'express';
import cookieParser from 'cookie-parser';
import routes from "./routes";
import compression from 'compression';
import cors from 'cors';

const app = express();
const port = process.env.PORT

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
}))

app.use(compression())
app.use(cookieParser())
app.use(express.json())

app.use('/', routes)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})