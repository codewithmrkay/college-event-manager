import express from 'express';
import protectRoute, { requireRole } from '../middlewares/protectRoute.js';
import { excelUpload } from '../middlewares/excelUpload.js';
import {
    // Onboarding
    getSAProfile,
    updateSAProfilePicture,
    updateSAAboutInfo,
    updateSAContactDetails,
    completeSAOnboarding,
    // Student Management
    getStudentStats,
    getStudents,
    verifyStudent,
    bulkVerifyStudents,
    // Excel Import
    importStudentExcel,
    // Candidates Search
    searchVerifiedStudents,
    // Admin Management
    getAdmins,
    promoteToAdmin,
    demoteFromAdmin,
    updateAdminCategory,
} from '../controllers/superAdmin.controller.js';

// Event verification — reuse existing event controller handlers
import {
    getAllEventsAdmin,
    verifyEvent,
    getEventByIdAdmin,
} from '../controllers/event.controller.js';

const router = express.Router();

// All routes in this file require super-admin role
router.use(protectRoute, requireRole('super-admin'));

// ─────────────────────────────────────────────────────────────────────────────
//  ONBOARDING
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/super-admin/profile
router.get('/profile', getSAProfile);

// PATCH /api/super-admin/profile-picture
router.patch('/profile-picture', updateSAProfilePicture);

// PATCH /api/super-admin/about
router.patch('/about', updateSAAboutInfo);

// PATCH /api/super-admin/contact
router.patch('/contact', updateSAContactDetails);

// POST /api/super-admin/complete-onboarding
router.post('/complete-onboarding', completeSAOnboarding);

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT MANAGEMENT
//  NOTE: /students/stats, /students/search, /students/bulk-verify
//  must come BEFORE /students/:id to avoid Express treating 'stats' as an id
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/super-admin/students/stats
router.get('/students/stats', getStudentStats);

// GET  /api/super-admin/students/search?q=John  (verified only — for admin candidate search)
router.get('/students/search', searchVerifiedStudents);

// PATCH /api/super-admin/students/bulk-verify
router.patch('/students/bulk-verify', bulkVerifyStudents);

// POST  /api/super-admin/students/import-excel  (multipart, field: "excelFile")
router.post(
    '/students/import-excel',
    excelUpload.single('excelFile'),
    importStudentExcel
);

// GET   /api/super-admin/students?search=&dept=&class=&verified=&page=&limit=
router.get('/students', getStudents);

// PATCH /api/super-admin/students/:id/verify
router.patch('/students/:id/verify', verifyStudent);

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN / COORDINATOR MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET   /api/super-admin/admins?category=Technical&page=&limit=
router.get('/admins', getAdmins);

// PATCH /api/super-admin/admins/:id/promote
router.patch('/admins/:id/promote', promoteToAdmin);

// PATCH /api/super-admin/admins/:id/demote
router.patch('/admins/:id/demote', demoteFromAdmin);

// PATCH /api/super-admin/admins/:id/category
router.patch('/admins/:id/category', updateAdminCategory);

// ─────────────────────────────────────────────────────────────────────────────
//  EVENT VERIFICATION  (delegates to event.controller.js)
// ─────────────────────────────────────────────────────────────────────────────

// GET   /api/super-admin/events?status=&isVerified=&category=&page=&limit=
router.get('/events', getAllEventsAdmin);

// GET   /api/super-admin/events/:id
router.get('/events/:id', getEventByIdAdmin);

// PATCH /api/super-admin/events/:id/verify
// Body: { isVerified: true|false, rejectionReason?: "Please update prize details" }
router.patch('/events/:id/verify', verifyEvent);

export default router;
