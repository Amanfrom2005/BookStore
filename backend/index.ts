import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import connectDb from './config/dbConnect';
import authRoutes from './routes/authRouter';

dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();

const corsOption = {
    origin: process.env.FRONTEND_URL,
    credential: true,
}

app.use(cors(corsOption));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

connectDb();

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})