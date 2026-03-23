import express from 'express';
import asyncHandler from 'express-async-handler';
import { Appointment, validateAppointment } from '../models/Appointment.js';
import { authMiddleware, authMiddlewareForAdd } from "../middleware/authMiddleware.js";
import { v4 } from 'uuid';
import jws from "jsonwebtoken";
const router = express.Router();




router.get("/createtokenAdmin", asyncHandler(async (req, res) => {
    const userId = v4();
    const token = jws.sign({ userId, role: "admin" }, process.env.JWT_SECRET);

    res.cookie("user_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date('9999-12-31T23:59:59.999Z')
    });

    res.json({ message: "تم إنشاء توكن المسؤول بنجاح", token });
}));

router.post('/add', validateAppointment, authMiddlewareForAdd, asyncHandler(async (req, res) => {
    const { name, appointmentDate, phone, age, doctor } = req.body;
    const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    const c1 = randomChars[Math.floor(Math.random() * randomChars.length)];
    const c2 = randomChars[Math.floor(Math.random() * randomChars.length)];
    const c3 = randomChars[Math.floor(Math.random() * randomChars.length)];
    let userId = req.user?.userId || null;
    const generatedCode = `${c1}${age}${c2}${c3}`;
    if (!userId) {
        userId = v4();
        console.log("Here")
        const token = jws.sign({ userId, role: "user" }, process.env.JWT_SECRET);

        res.cookie("user_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date('9999-12-31T23:59:59.999Z')
        });

    }

    console.log(process.env.JWT_SECRET)
    const appointment = await Appointment.create({
        name,
        appointmentDate,
        phone,
        age,
        code: generatedCode,
        doctor,
        userId
    });

    const queuePosition = await Appointment.countDocuments({ appointmentDate, status: "pending", doctor, createdAt: { $lt: appointment.createdAt } });

    res.status(201).json({
        success: true,
        message: "تم تسجيل الحجز بنجاح",
        data: {
            ...appointment._doc,
            patientsAhead: queuePosition,
            yourTurnNumber: queuePosition + 1
        }
    });
}));


router.get("/get", asyncHandler(async (req, res) => {
    const EXCLUDED_KEYS = ["limit", "page"];

    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const filter = Object.fromEntries(
        Object.entries(req.query).filter(([key]) => !EXCLUDED_KEYS.includes(key))
    );

    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        total,
        page,
        pages: limit ? Math.ceil(total / limit) : 1,
        count: appointments.length,
        data: appointments,
    });
}));

router.get("/my-appointments", authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    console.log(userId)
    const appointments = await Appointment.find({ userId });

    res.status(200).json({
        success: true,
        message: "تم جلب الحجوزات بنجاح",
        data: appointments
    });
}));

router.put("/update/:id", authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, appointmentDate, phone, age, doctor, status } = req.body;
    const appointmentToUpdate = await Appointment.findById(id);

    if (!appointmentToUpdate) {
        return res.status(404).json({
            success: false,
            message: "لم يتم العثور على الحجز"
        });
    }
    
    if (appointmentToUpdate.userId !== req.user.userId && req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "ليس لديك صلاحية تعديل هذا الحجز"
        });
    }
    const appointment = await Appointment.findByIdAndUpdate(id, {
        name,
        appointmentDate,
        phone,
        age,
        doctor,
        status
    }, { returnDocument: 'after' });

    res.status(200).json({
        success: true,
        message: "تم تحديث الحجز بنجاح",
        data: appointment
    });
}));

router.delete("/delete/:id", authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const appointmentToUpdate = await Appointment.findById(id);

    if (!appointmentToUpdate) {
        return res.status(404).json({
            success: false,
            message: "لم يتم العثور على الحجز"
        });
    }
    if (appointmentToUpdate.userId !== req.user.userId && req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "ليس لديك صلاحية تعديل هذا الحجز"
        });
    }
    const appointment = await Appointment.findByIdAndDelete(id);


    res.status(200).json({
        success: true,
        message: "تم حذف الحجز بنجاح",
        data: appointment
    });
}));


router.get("/my-appointments", authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.userId;

    const appointments = await Appointment.find({ userId });

    res.status(200).json({
        success: true,
        message: "تم جلب الحجوزات بنجاح",
        data: appointments
    });
}));

router.get("/:code", asyncHandler(async (req, res) => {
    const { code } = req.params;
    const appointment = await Appointment.findOne({ code });

    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: "لم يتم العثور على الحجز"
        });
    }

    res.status(200).json({
        success: true,
        message: "تم جلب الحجز بنجاح",
        data: appointment
    });
}));

export default router;