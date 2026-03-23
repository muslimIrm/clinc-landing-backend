import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import appointmentRouter from './routes/appointmentRoutes.js';
import complaintRouter from './routes/complaintRoutes.js';
import globalErrorHandler from './middleware/errorMiddleware.js';
import startServer from "./dbContact/DbContact.js";
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import cors from "cors";

const app = express();

// middlewares الأساسية
app.use(cors({
  origin: "https://clinc-landing.vercel.app",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(hpp());

// limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// routes
app.use('/api/appointments', appointmentRouter);
app.use('/api/complaints', complaintRouter);

// error handler (آخر شيء)
app.use(globalErrorHandler);

startServer(app);