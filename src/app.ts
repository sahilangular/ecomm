import express from "express";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import paymentRoutes from "./routes/payment.js";
import { connectDB } from "./utils/feature.js";
import { errorMiddleWare } from "./middleware/error.js";
import orderRoutes from './routes/order.js'
import dashBoardRoutes from './routes/stats.js'
import {config} from 'dotenv'
import morgan from 'morgan';
import Stripe from "stripe";
import cors from 'cors'

config({
  path:"./.env"
})

const mongo_uri = process.env.DATABASE_URI || "" as string;
const stripe_key  = process.env.STRIPE_API_KEY || ""

connectDB(mongo_uri);

export const stripe =  new Stripe(stripe_key)

const app = express();

app.use(cors());

app.use(express.json());

app.use(morgan('dev'));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", dashBoardRoutes);

app.use('/uploads',express.static('uploads'));

app.use(errorMiddleWare)

app.listen(8080, () => {
  console.log("server running in 8080");
});
