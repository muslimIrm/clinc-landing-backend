import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.user_token;

  if (!token) {
    return res.status(401).json({ message: "لا يوجد توكن، يرجى الحجز أولاً" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ message: "التوكن غير صالح" });
    }

    req.user = decoded;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'التوكن منتهي الصلاحية' });
    }
    return res.status(403).json({ message: 'التوكن غير صحيح' });
  }
};

export const authMiddlewareForAdd = async (req, res, next) => {
  const token = req.cookies?.user_token;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
  }

  next();
};