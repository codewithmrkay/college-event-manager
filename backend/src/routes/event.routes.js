import express from 'express';
import protectRoute, { requireRole } from '../middlewares/protectRoute.js';
import {
    // Admin (admin + super-admin)
    createEventBasicInfo,
    updateEventBasicInfo,
    updateEventCategory,
    updateEventParticipation,
    updateEventDates,
    updateEventCapacity,
    updateEventMedia,
    updateEventRules,
    submitEvent,
    deleteEvent,
    getAdminEvents,
    getEventByIdAdmin,
    // Super-admin only
    getAllEventsAdmin,
    verifyEvent,
    // Public / Student
    getPublicEvents,
    getPublicEventBySlug,
    showInterest,
    removeInterest,
} from '../controllers/event.controller.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC ROUTES  (no auth required)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/events?status=upcoming|live|past&category=Technical&page=1&limit=12
router.get('/events', getPublicEvents);

// GET /api/events/:slug
router.get('/events/:slug', getPublicEventBySlug);

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT INTEREST  (auth required, any role)
// ─────────────────────────────────────────────────────────────────────────────

// POST   /api/events/:id/interest
router.post('/events/:id/interest', protectRoute, showInterest);

// DELETE /api/events/:id/interest
router.delete('/events/:id/interest', protectRoute, removeInterest);

// ─────────────────────────────────────────────────────────────────────────────
//  SUPER-ADMIN ONLY ROUTES  (must come BEFORE /:id routes to avoid conflict)
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/admin/events/all — view ALL events (verified + unverified)
router.get(
    '/admin/events/all',
    protectRoute,
    requireRole('super-admin'),
    getAllEventsAdmin
);

// PATCH /api/admin/events/:id/verify — approve or reject an event
router.patch(
    '/admin/events/:id/verify',
    protectRoute,
    requireRole('super-admin'),
    verifyEvent
);

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN ROUTES  (admin + super-admin)
// ─────────────────────────────────────────────────────────────────────────────

// POST  /api/admin/events — create a new event draft (Basic Info)
router.post(
    '/admin/events',
    protectRoute,
    requireRole('admin', 'super-admin'),
    createEventBasicInfo
);

// GET   /api/admin/events — list own events (admin) or all (use /all for super-admin)
router.get(
    '/admin/events',
    protectRoute,
    requireRole('admin', 'super-admin'),
    getAdminEvents
);

// GET   /api/admin/events/:id — single event detail
router.get(
    '/admin/events/:id',
    protectRoute,
    requireRole('admin', 'super-admin'),
    getEventByIdAdmin
);

// PATCH /api/admin/events/:id/basic-info — update basic info
router.patch(
    '/admin/events/:id/basic-info',
    protectRoute,
    requireRole('admin', 'super-admin'),
    updateEventBasicInfo
);

// PATCH /api/admin/events/:id/category — update category
router.patch(
    '/admin/events/:id/category',
    protectRoute,
    requireRole('admin', 'super-admin'),
    updateEventCategory
);

// PATCH /api/admin/events/:id/participation — update participation
router.patch(
    '/admin/events/:id/participation',
    protectRoute,
    requireRole('admin', 'super-admin'),
    updateEventParticipation
);

// PATCH /api/admin/events/:id/dates — update dates
router.patch(
    '/admin/events/:id/dates',
    protectRoute,
    requireRole('admin', 'super-admin'),
    updateEventDates
);

// PATCH /api/admin/events/:id/capacity — update capacity
router.patch(
    '/admin/events/:id/capacity',
    protectRoute,
    requireRole('admin', 'super-admin'),
    updateEventCapacity
);

// PATCH /api/admin/events/:id/media — update media
router.patch(
    '/admin/events/:id/media',
    protectRoute,
    requireRole('admin', 'super-admin'),
    updateEventMedia
);

// PATCH /api/admin/events/:id/rules — update rules
router.patch(
    '/admin/events/:id/rules',
    protectRoute,
    requireRole('admin', 'super-admin'),
    updateEventRules
);

// POST /api/admin/events/:id/submit — submit event for verification
router.post(
    '/admin/events/:id/submit',
    protectRoute,
    requireRole('admin', 'super-admin'),
    submitEvent
);

// DELETE /api/admin/events/:id — delete event
router.delete(
    '/admin/events/:id',
    protectRoute,
    requireRole('admin', 'super-admin'),
    deleteEvent
);

export default router;
