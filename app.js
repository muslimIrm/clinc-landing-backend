
import dotenv from 'dotenv';

dotenv.config();
import express from "express";
import appointmentRouter from './routes/appointmentRoutes.js';
import complaintRouter from './routes/complaintRoutes.js';
import globalErrorHandler from './middleware/errorMiddleware.js'; 
import startServer from "./dbContact/DbContact.js";
import cookieParser from "cookie-parser"
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cors from "cors"
const app = express();

startServer(app)
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(hpp());
app.use(mongoSanitize());

app.use('/api/appointments', appointmentRouter);
app.use('/api/complaints', complaintRouter);

app.use(globalErrorHandler);

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'طلبات كثيرة جداً، حاول لاحقاً' }
}));

app.use(cors({
  origin: 'https://clinc-landing.vercel.app/', 
  credentials: true 
}));