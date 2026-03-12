import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import {
    applyEvent,
    getMyApplications,
    cancelApplication,
} from '../controllers/registration.controller.js';

const router = express.Router();

// POST /api/events/:id/apply — student applies to an event
router.post('/events/:id/apply', protectRoute, applyEvent);

// GET /api/registrations/my — student's own applications
router.get('/registrations/my', protectRoute, getMyApplications);

// DELETE /api/registrations/:registrationId/cancel — cancel an application
router.delete('/registrations/:registrationId/cancel', protectRoute, cancelApplication);

// ── Admin Routes ─────────────────────────────────────────────────────────────

import { requireRole } from '../middlewares/protectRoute.js';
import { getEventParticipants, markAttendance } from '../controllers/registration.controller.js';

// GET /api/admin/events/:id/participants — admin fetches participants
router.get('/admin/events/:id/participants', protectRoute, requireRole('admin', 'super-admin'), getEventParticipants);

// PATCH /api/admin/registrations/:registrationId/attendance — admin marks attendance
router.patch('/admin/registrations/:registrationId/attendance', protectRoute, requireRole('admin', 'super-admin'), markAttendance);

export default router;
