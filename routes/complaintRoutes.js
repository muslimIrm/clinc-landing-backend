import express from 'express';
import asyncHandler from 'express-async-handler';
import { Complaint, validateComplaint } from '../models/Complaint.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

// User: Submit a complaint
router.post('/add', validateComplaint, asyncHandler(async (req, res) => {
    const { name, phone, subject, complaint } = req.body;

    const NewComplaint = await Complaint.create({
        name,
        phone,
        subject,
        complaint
    });

    res.status(201).json({
        success: true,
        message: "تم إرسال الشكوى بنجاح",
        data: NewComplaint
    });
}));

// Admin: Get all complaints with filtering
router.get("/get", authMiddleware, asyncHandler(async (req, res) => {
    const EXCLUDED_KEYS = ["limit", "page", "sort"];
    
    if (req.user.role !== "admin") {
        return res.json({
            success: false,
            message: "ليس لديك صلاحية الوصول إلى هذه البيانات"
        }); 
    }
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sort || "-createdAt"; // Default: newest first

    const filter = Object.fromEntries(
        Object.entries(req.query).filter(([key]) => !EXCLUDED_KEYS.includes(key))
    );

    const total = await Complaint.countDocuments(filter);

    const complaints = await Complaint.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        total,
        page,
        pages: limit ? Math.ceil(total / limit) : 1,
        count: complaints.length,
        data: complaints,
    });
}));

// Admin: Get complaint by ID
router.get("/get/:id", authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (req.user.role !== "admin") {
        return res.json({
            success: false,
            message: "ليس لديك صلاحية الوصول إلى هذه البيانات"
        });
    }
    if (!complaint) {
        return res.status(404).json({
            success: false,
            message: "لم يتم العثور على الشكوى"
        });
    }

    res.status(200).json({
        success: true,
        data: complaint
    });
}));

// Admin: Update complaint status and add notes
router.put("/update/:id", authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "admin") {
        return res.json({
            success: false,
            message: "ليس لديك صلاحية الوصول إلى هذه البيانات"
        });
    }
    const updateData = {};
    if (status) updateData.status = status;


    const complaint = await Complaint.findByIdAndUpdate(id, updateData, { new: true });

    if (!complaint) {
        return res.status(404).json({
            success: false,
            message: "لم يتم العثور على الشكوى"
        });
    }

    res.status(200).json({
        success: true,
        message: "تم تحديث الشكوى بنجاح",
        data: complaint
    });
}));

// Admin: Delete complaint
router.delete("/delete/:id", authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== "admin") {
        return res.json({
            success: false,
            message: "ليس لديك صلاحية الوصول إلى هذه البيانات"
        });
    }
    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
        return res.status(404).json({
            success: false,
            message: "لم يتم العثور على الشكوى"
        });
    }

    res.status(200).json({
        success: true,
        message: "تم حذف الشكوى بنجاح",
        data: complaint
    });
}));

// Admin: Get complaint statistics
router.get("/stats/summary", authMiddleware, asyncHandler(async (req, res) => {

    if (req.user.role !== "admin") {
        return res.json({
            success: false,
            message: "ليس لديك صلاحية الوصول إلى هذه البيانات"
        });
    }
    const totalComplaints = await Complaint.countDocuments();
    const newComplaints = await Complaint.countDocuments({ status: "new" });
    const reviewComplaints = await Complaint.countDocuments({ status: "in-progress" });
    const resolvedComplaints = await Complaint.countDocuments({ status: "resolved" });

    res.status(200).json({
        success: true,
        data: {
            total: totalComplaints,
            new: newComplaints,
            review: reviewComplaints,
            resolved: resolvedComplaints
        }
    });
}));

export default router;
