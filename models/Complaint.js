import mongoose from "mongoose";
import { body, validationResult } from "express-validator";

const complaintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "يجب إدخال الاسم"],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, "رقم الهاتف مطلوب"],
        trim: true,
    },
    subject: {
        type: String,
        required: [true, "الموضوع مطلوب"],
        trim: true,
    },
    message: {
        type: String,
        required: [true, "الشكوى مطلوبة"],
        trim: true,
    },
    status: {
        type: String,
        enum: ["new", "in-progress", "resolved"],
        default: "new",
    }
}, {
    timestamps: true
});

export const Complaint = mongoose.model("Complaint", complaintSchema);

export const validateComplaint = [
    body('name').notEmpty().withMessage('الاسم مطلوب'),
    body('phone').notEmpty().withMessage('رقم الهاتف مطلوب'),
    body('subject').notEmpty().withMessage('الموضوع مطلوب'),
    body('message').notEmpty().withMessage('الشكوى مطلوبة'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
