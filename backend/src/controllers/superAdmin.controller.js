import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import { User } from '../models/user.model.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_DEPARTMENTS = ['BCS', 'BCA', 'BBA', 'BCOM', 'BSC'];
const VALID_CLASSES = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const VALID_ADMIN_CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Academic', 'Social', 'Other'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safeStr = (v) => (v !== undefined && v !== null ? String(v).trim() : '');

// =============================================================================
// SUPER-ADMIN ONBOARDING
// Lighter than student onboarding — no dept/class/rollNo required
// =============================================================================

/**
 * GET /api/super-admin/profile
 */
export const getSAProfile = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            gender: user.gender,
            profilePic: user.profilePic,
            phoneNumber: user.phoneNumber,
            links: user.links,
            role: user.role,
            isOnboarded: user.isOnboarded,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('getSAProfile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/super-admin/profile-picture
 * Body: { profilePic: "cloudinary_url" }
 */
export const updateSAProfilePicture = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if (!profilePic) {
            return res.status(400).json({ message: 'Profile picture URL is required' });
        }
        if (!profilePic.startsWith('https://res.cloudinary.com/')) {
            return res.status(400).json({ message: 'Invalid Cloudinary image URL' });
        }

        req.user.profilePic = profilePic;
        await req.user.save();

        res.status(200).json({
            message: 'Profile picture updated successfully',
            profilePic: req.user.profilePic,
        });
    } catch (error) {
        console.error('updateSAProfilePicture error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/super-admin/about
 * Body: { fullName, gender }
 */
export const updateSAAboutInfo = async (req, res) => {
    try {
        const { fullName, gender } = req.body;

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ message: 'Full name is required' });
        }
        if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
            return res.status(400).json({ message: 'Invalid gender value' });
        }

        req.user.fullName = fullName.trim();
        if (gender) req.user.gender = gender;
        await req.user.save();

        res.status(200).json({
            message: 'About info updated successfully',
            fullName: req.user.fullName,
            gender: req.user.gender,
        });
    } catch (error) {
        console.error('updateSAAboutInfo error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/super-admin/contact
 * Body: { phoneNumber, links: { linkedin, github, portfolio } }
 */
export const updateSAContactDetails = async (req, res) => {
    try {
        const { phoneNumber, links } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits.' });
        }
        req.user.phoneNumber = phoneNumber;

        if (links) {
            const validLinks = {};
            if (links.linkedin) {
                if (!links.linkedin.startsWith('https://linkedin.com/') &&
                    !links.linkedin.startsWith('https://www.linkedin.com/')) {
                    return res.status(400).json({ message: 'Invalid LinkedIn URL' });
                }
                validLinks.linkedin = links.linkedin;
            }
            if (links.github) {
                if (!links.github.startsWith('https://github.com/')) {
                    return res.status(400).json({ message: 'Invalid GitHub URL' });
                }
                validLinks.github = links.github;
            }
            if (links.portfolio) {
                try { new URL(links.portfolio); validLinks.portfolio = links.portfolio; }
                catch { return res.status(400).json({ message: 'Invalid portfolio URL' }); }
            }
            req.user.links = validLinks;
        }

        await req.user.save();

        res.status(200).json({
            message: 'Contact details updated successfully',
            phoneNumber: req.user.phoneNumber,
            links: req.user.links,
        });
    } catch (error) {
        console.error('updateSAContactDetails error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/super-admin/complete-onboarding
 * Lighter check — only fullName + profilePic + phoneNumber required
 */
export const completeSAOnboarding = async (req, res) => {
    try {
        const user = req.user;
        if (user.isOnboarded) {
            return res.status(400).json({ message: 'Already onboarded' });
        }

        const requiredFields = {
            fullName: user.fullName,
            profilePic: user.profilePic,
            phoneNumber: user.phoneNumber,
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([, v]) => !v)
            .map(([k]) => k);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Please complete all required sections',
                missingFields,
            });
        }

        user.isOnboarded = true;
        await user.save();

        res.status(200).json({
            message: 'Super-admin onboarding complete!',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isOnboarded: user.isOnboarded,
            },
        });
    } catch (error) {
        console.error('completeSAOnboarding error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// =============================================================================
// STUDENT MANAGEMENT
// =============================================================================

/**
 * GET /api/super-admin/students/stats
 * Returns aggregate counts for dashboard.
 */
export const getStudentStats = async (req, res) => {
    try {
        const [total, verified, pendingVerification, notRegistered] = await Promise.all([
            // All users with role student
            User.countDocuments({ role: 'student' }),
            // Onboarded + verified
            User.countDocuments({ role: 'student', isOnboarded: true, isVerified: true }),
            // Onboarded but not yet verified (fee receipt submitted)
            User.countDocuments({ role: 'student', isOnboarded: true, isVerified: false }),
            // Not yet onboarded at all
            User.countDocuments({ role: 'student', isOnboarded: false }),
        ]);

        res.status(200).json({
            stats: {
                total,
                verified,
                pendingVerification,
                notRegistered,
            },
        });
    } catch (error) {
        console.error('getStudentStats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/super-admin/students
 * Paginated student list with search and filters.
 * Query: ?search=John&dept=BCS&class=1st+Year&verified=true|false|pending&page=1&limit=20
 */
export const getStudents = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const filter = { role: 'student' };

        // Search: match fullName OR rollNo OR email (case-insensitive)
        if (req.query.search) {
            const regex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { fullName: regex },
                { rollNo: regex },
                { email: regex },
            ];
        }

        if (req.query.dept && VALID_DEPARTMENTS.includes(req.query.dept)) {
            filter.department = req.query.dept;
        }
        if (req.query.class) {
            filter.class = req.query.class;
        }

        // verified filter
        if (req.query.verified === 'true') {
            filter.isOnboarded = true; filter.isVerified = true;
        } else if (req.query.verified === 'false') {
            // Explicitly rejected / not verified — onboarded but not verified
            filter.isOnboarded = true; filter.isVerified = false;
        } else if (req.query.verified === 'pending') {
            // Onboarded with fee receipt uploaded but not yet reviewed
            filter.isOnboarded = true;
            filter.isVerified = false;
            filter.collegeFeeImg = { $ne: null, $exists: true };
        }

        const [students, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('fullName email gender department class rollNo profilePic collegeFeeImg isVerified isOnboarded phoneNumber createdAt'),
            User.countDocuments(filter),
        ]);

        res.status(200).json({
            students,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('getStudents error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/super-admin/students/:id/verify
 * Body: { isVerified: true|false }
 * Approves or rejects a student's account after checking fee receipt.
 */
export const verifyStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }
        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ message: 'isVerified (boolean) is required' });
        }

        const student = await User.findOne({ _id: id, role: 'student' });
        if (!student) return res.status(404).json({ message: 'Student not found' });
        if (!student.isOnboarded) {
            return res.status(400).json({ message: 'Student has not completed onboarding yet' });
        }

        student.isVerified = isVerified;
        await student.save();

        res.status(200).json({
            message: isVerified ? 'Student verified successfully' : 'Student verification revoked',
            student: {
                _id: student._id,
                fullName: student.fullName,
                email: student.email,
                isVerified: student.isVerified,
            },
        });
    } catch (error) {
        console.error('verifyStudent error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/super-admin/students/bulk-verify
 * Body: { studentIds: ["id1", "id2"], isVerified: true }
 * Bulk approve or revoke verification for multiple students.
 */
export const bulkVerifyStudents = async (req, res) => {
    try {
        const { studentIds, isVerified } = req.body;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'studentIds array is required' });
        }
        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ message: 'isVerified (boolean) is required' });
        }

        const validIds = studentIds.filter((id) => mongoose.isValidObjectId(id));
        if (validIds.length === 0) {
            return res.status(400).json({ message: 'No valid student IDs provided' });
        }

        const result = await User.updateMany(
            { _id: { $in: validIds }, role: 'student', isOnboarded: true },
            { $set: { isVerified } }
        );

        res.status(200).json({
            message: `${result.modifiedCount} student(s) ${isVerified ? 'verified' : 'unverified'}`,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('bulkVerifyStudents error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// =============================================================================
// EXCEL IMPORT
// =============================================================================

/**
 * POST /api/super-admin/students/import-excel
 * Multipart/form-data, field: "excelFile"
 *
 * Parses the uploaded Excel/CSV and returns a preview of the data + summary stats.
 * This is a READ-ONLY audit tool — it does NOT create user accounts.
 * Super-admin uses this to compare the official student roll against registered users.
 */
export const importStudentExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Excel file is required' });
        }

        // Parse workbook from buffer
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON — skip empty rows
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rows.length === 0) {
            return res.status(400).json({ message: 'The file is empty or has no data rows' });
        }

        // Normalise columns — be flexible about header casing
        const normalise = (row) => ({
            fullName: safeStr(row['Full Name'] || row['fullName'] || row['Name'] || row['name']),
            email: safeStr(row['Email'] || row['email']).toLowerCase(),
            rollNo: safeStr(row['Roll No'] || row['rollNo'] || row['Roll Number'] || row['roll']),
            department: safeStr(row['Department'] || row['department'] || row['Dept'] || row['dept']),
            class: safeStr(row['Class'] || row['class'] || row['Year'] || row['year']),
            phoneNumber: safeStr(row['Phone'] || row['phone'] || row['phoneNumber']),
            feesImgId: safeStr(row['Fees Image ID'] || row['feesImgId'] || row['Fee ID']),
        });

        const parsedRows = rows.map(normalise).filter((r) => r.fullName || r.email || r.rollNo);
        const totalInFile = parsedRows.length;

        // Cross-reference with existing users by email / rollNo
        const emails = parsedRows.map((r) => r.email).filter(Boolean);
        const rollNos = parsedRows.map((r) => r.rollNo).filter(Boolean);

        const [registeredByEmail, registeredByRoll] = await Promise.all([
            User.find({ email: { $in: emails }, role: 'student' }).select('email rollNo isVerified isOnboarded'),
            User.find({ rollNo: { $in: rollNos }, role: 'student' }).select('email rollNo isVerified isOnboarded'),
        ]);

        const registeredEmails = new Set(registeredByEmail.map((u) => u.email));
        const registeredRolls = new Set(registeredByRoll.map((u) => u.rollNo));

        // Build per-row status
        const preview = parsedRows.map((r) => {
            const regByEmail = registeredByEmail.find((u) => u.email === r.email);
            const regByRoll = registeredByRoll.find((u) => u.rollNo === r.rollNo);
            const user = regByEmail || regByRoll;

            return {
                ...r,
                registeredOnPlatform: !!(registeredEmails.has(r.email) || registeredRolls.has(r.rollNo)),
                isVerified: user ? user.isVerified : null,
                isOnboarded: user ? user.isOnboarded : null,
            };
        });

        const stats = {
            totalInFile,
            registeredOnPlatform: preview.filter((r) => r.registeredOnPlatform).length,
            verified: preview.filter((r) => r.isVerified === true).length,
            pendingVerification: preview.filter((r) => r.registeredOnPlatform && r.isVerified === false).length,
            notRegistered: preview.filter((r) => !r.registeredOnPlatform).length,
        };

        res.status(200).json({
            message: 'Excel parsed successfully',
            fileName: req.file.originalname,
            sheetName,
            stats,
            // Return first 100 rows as preview to avoid huge payloads
            preview: preview.slice(0, 100),
            totalRows: totalInFile,
        });
    } catch (error) {
        console.error('importStudentExcel error:', error);
        res.status(500).json({ message: 'Failed to parse Excel file: ' + error.message });
    }
};

// =============================================================================
// ADMIN / COORDINATOR MANAGEMENT
// =============================================================================

/**
 * GET /api/super-admin/students/search?q=John
 * Quick search among VERIFIED students to find admin candidates.
 * Returns lightweight list (no sensitive data).
 */
export const searchVerifiedStudents = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const regex = new RegExp(q.trim(), 'i');
        const students = await User.find({
            role: 'student',
            isVerified: true,
            isOnboarded: true,
            $or: [{ fullName: regex }, { rollNo: regex }, { email: regex }],
        })
            .limit(20)
            .select('fullName email rollNo department class profilePic');

        res.status(200).json({ students });
    } catch (error) {
        console.error('searchVerifiedStudents error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/super-admin/admins
 * Paginated list of all current admins with their assigned categories.
 * Query: ?category=Technical&page=1&limit=20
 */
export const getAdmins = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const filter = { role: 'admin' };
        if (req.query.category && VALID_ADMIN_CATEGORIES.includes(req.query.category)) {
            filter.adminCategory = req.query.category;
        }

        const [admins, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('fullName email profilePic department class rollNo adminCategory adminCategoryDescription phoneNumber createdAt'),
            User.countDocuments(filter),
        ]);

        res.status(200).json({
            admins,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('getAdmins error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/super-admin/admins/:id/promote
 * Promote a verified student to admin and assign event categories.
 * Body: { adminCategory: ["Technical", "Sports"], adminCategoryDescription?: "..." }
 */
export const promoteToAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminCategory, adminCategoryDescription } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        if (!Array.isArray(adminCategory) || adminCategory.length === 0) {
            return res.status(400).json({ message: 'adminCategory array is required' });
        }

        const invalidCats = adminCategory.filter((c) => !VALID_ADMIN_CATEGORIES.includes(c));
        if (invalidCats.length > 0) {
            return res.status(400).json({
                message: `Invalid categories: ${invalidCats.join(', ')}`,
                validOptions: VALID_ADMIN_CATEGORIES,
            });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Only verified students can be promoted to admin' });
        }
        if (user.role === 'super-admin') {
            return res.status(400).json({ message: 'Cannot change a super-admin\'s role' });
        }

        user.role = 'admin';
        user.adminCategory = adminCategory;
        user.adminCategoryDescription = adminCategoryDescription?.trim() || null;
        await user.save();

        res.status(200).json({
            message: `${user.fullName} has been promoted to admin`,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                adminCategory: user.adminCategory,
                adminCategoryDescription: user.adminCategoryDescription,
            },
        });
    } catch (error) {
        console.error('promoteToAdmin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/super-admin/admins/:id/demote
 * Demote an admin back to student, clear their categories.
 */
export const demoteFromAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'admin') {
            return res.status(400).json({ message: 'User is not an admin' });
        }

        user.role = 'student';
        user.adminCategory = [];
        user.adminCategoryDescription = null;
        await user.save();

        res.status(200).json({
            message: `${user.fullName} has been demoted to student`,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('demoteFromAdmin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/super-admin/admins/:id/category
 * Update the event categories assigned to an existing admin.
 * Body: { adminCategory: ["Cultural", "Academic"], adminCategoryDescription?: "..." }
 */
export const updateAdminCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminCategory, adminCategoryDescription } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        if (!Array.isArray(adminCategory) || adminCategory.length === 0) {
            return res.status(400).json({ message: 'adminCategory array is required' });
        }

        const invalidCats = adminCategory.filter((c) => !VALID_ADMIN_CATEGORIES.includes(c));
        if (invalidCats.length > 0) {
            return res.status(400).json({
                message: `Invalid categories: ${invalidCats.join(', ')}`,
                validOptions: VALID_ADMIN_CATEGORIES,
            });
        }

        const user = await User.findOne({ _id: id, role: 'admin' });
        if (!user) return res.status(404).json({ message: 'Admin not found' });

        user.adminCategory = adminCategory;
        if (adminCategoryDescription !== undefined) {
            user.adminCategoryDescription = adminCategoryDescription?.trim() || null;
        }
        await user.save();

        res.status(200).json({
            message: 'Admin categories updated successfully',
            user: {
                _id: user._id,
                fullName: user.fullName,
                adminCategory: user.adminCategory,
                adminCategoryDescription: user.adminCategoryDescription,
            },
        });
    } catch (error) {
        console.error('updateAdminCategory error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
