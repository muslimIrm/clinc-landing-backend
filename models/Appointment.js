import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
const appointmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "يجب إدخال الاسم"],
        trim: true,
        index: true,
    },
    appointmentDate: {
        type: Date,
        required: [true, "يجب تحديد موعد الحجز"],
    },
    age: {
        type: Number,
        required: true,
    },
    code: {
        type: String,
        unique: true,
        required: true,
    },
    phone: {
        type: String,
        required: [true, "رقم الهاتف مطلوب"],
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending",
    },
    doctor: {
        type: String,
        default: "الدكتور غير محدد",
    },
    userId: {
        type: String,
        required: true,

    }
}, {
    timestamps: true
});


export const Appointment = mongoose.model("Appointment", appointmentSchema);

export const validateAppointment = [
    body('name').notEmpty().withMessage('الاسم مطلوب'),
    body('phone').isMobilePhone().withMessage('يرجى إدخال رقم هاتف صحيح'),
    body('appointmentDate').isISO8601().withMessage('التاريخ غير صحيح'),
    body('age').isInt({ min: 1 }).withMessage('العمر يجب أن يكون رقماً صحيحاً'),
    body('doctor').notEmpty().withMessage("اسم الطبيب مطلوب."),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
