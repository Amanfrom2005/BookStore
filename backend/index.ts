import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import connectDb from './config/dbConnect';
import authRoutes from './routes/authRouter';
import productRoutes from './routes/productRoute';
import cartRoutes from './routes/cartRoute';
import wishListRoutes from './routes/wishListRoute';
import addressRoutes from './routes/addressRoute';
import userRoute from './routes/userRoute';
import orderRoute from './routes/orderRoute';

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
app.use('/api/product', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishListRoutes)
app.use('/api/user/address', addressRoutes)
app.use('/api/user', userRoute)
app.use('/api/order', orderRoute)

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})