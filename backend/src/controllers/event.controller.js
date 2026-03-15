import mongoose from 'mongoose';
import { Event } from '../models/event.model.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map a ?status query param to a MongoDB filter on the Event collection */
const buildStatusFilter = (status) => {
    const now = new Date();

    // Past: Registration or Event has ended
    const isPast = {
        $or: [
            { registrationEnd: { $ne: null, $lt: now } },
            { eventEndDate: { $ne: null, $lt: now } }
        ]
    };

    // Live: Registration is explicitly open AND has started AND has not ended
    const isLive = {
        isRegistrationOpen: true,
        registrationStart: { $ne: null, $lte: now },
        eventStartDate: { $ne: null },
        $and: [
            { $or: [{ registrationEnd: null }, { registrationEnd: { $gt: now } }] },
            { $or: [{ eventEndDate: null }, { eventEndDate: { $gt: now } }] }
        ]
    };

    if (status === 'past') return isPast;
    if (status === 'live') return isLive;

    // Upcoming: Everything else (Registration not open, or haven't reached start date, or dates TBD)
    return {
        $nor: [isPast, isLive]
    };
};

/** Helper to find an event and verify admin coordination */
const findAdminEvent = async (id, user) => {
    if (!mongoose.isValidObjectId(id)) return null;
    const event = await Event.findById(id);
    if (!event) return null;
    if (user.role === 'super-admin') return event;
    const isCoordinator = event.coordinators.some(c => c.toString() === user._id.toString());
    return isCoordinator ? event : null;
};

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN ACTIONS  (admin + super-admin)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/events
 * Step 1: Create a new draft event with Basic Info
 */
export const createEventBasicInfo = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        // The requesting admin is the creator/coordinator
        const event = new Event({
            title,
            description,
            coordinators: [req.user._id],
            isDraft: true,
            // the rest will take defaults (null, [], etc.)
        });

        await event.save();

        res.status(201).json({
            message: 'Event draft created',
            eventId: event._id,
            slug: event.slug
        });
    } catch (error) {
        console.error('createEventBasicInfo error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'An event with this title/slug already exists.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/events/:id/basic-info
 * Update Basic Info
 */
export const updateEventBasicInfo = async (req, res) => {
    try {
        const event = await findAdminEvent(req.params.id, req.user);
        if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

        const { title, description } = req.body;
        if (title) event.title = title;
        if (description) event.description = description;

        await event.save();
        res.status(200).json({ message: 'Basic info updated', event });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/events/:id/category
 */
export const updateEventCategory = async (req, res) => {
    try {
        const event = await findAdminEvent(req.params.id, req.user);
        if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

        const { category, eventType } = req.body;
        if (category) event.category = category;
        if (eventType) event.eventType = eventType;

        await event.save();
        res.status(200).json({ message: 'Category info updated', event });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/events/:id/participation
 */
export const updateEventParticipation = async (req, res) => {
    try {
        const event = await findAdminEvent(req.params.id, req.user);
        if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

        const { participationType, minTeamSize, maxTeamSize } = req.body;
        if (participationType) event.participationType = participationType;

        if (participationType === 'Solo') {
            event.minTeamSize = null;
            event.maxTeamSize = null;
        } else {
            if (minTeamSize !== undefined) event.minTeamSize = minTeamSize;
            if (maxTeamSize !== undefined) event.maxTeamSize = maxTeamSize;
        }

        await event.save();
        res.status(200).json({ message: 'Participation info updated', event });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/events/:id/dates
 */
export const updateEventDates = async (req, res) => {
    try {
        const event = await findAdminEvent(req.params.id, req.user);
        if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

        const { registrationStart, registrationEnd, eventStartDate, eventEndDate, venue, isOnline } = req.body;

        if (registrationStart !== undefined) event.registrationStart = registrationStart;
        if (registrationEnd !== undefined) event.registrationEnd = registrationEnd;
        if (eventStartDate !== undefined) event.eventStartDate = eventStartDate;
        if (eventEndDate !== undefined) event.eventEndDate = eventEndDate;
        if (venue !== undefined) event.venue = venue;
        if (isOnline !== undefined) event.isOnline = isOnline;

        await event.save();
        res.status(200).json({ message: 'Dates & Venue updated', event });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/events/:id/capacity
 */
export const updateEventCapacity = async (req, res) => {
    try {
        const event = await findAdminEvent(req.params.id, req.user);
        if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

        const { maxParticipants, registrationFee, prizeMoney, hasCertificate, isRegistrationOpen } = req.body;

        if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
        if (registrationFee !== undefined) event.registrationFee = registrationFee;
        if (prizeMoney !== undefined) event.prizeMoney = prizeMoney;
        if (hasCertificate !== undefined) event.hasCertificate = hasCertificate;
        if (isRegistrationOpen !== undefined) event.isRegistrationOpen = isRegistrationOpen;

        await event.save();
        res.status(200).json({ message: 'Capacity & Fees updated', event });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/events/:id/media
 */
export const updateEventMedia = async (req, res) => {
    try {
        const event = await findAdminEvent(req.params.id, req.user);
        if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

        const { bannerImage } = req.body;
        if (bannerImage) event.bannerImage = bannerImage;

        await event.save();
        res.status(200).json({ message: 'Media updated', event });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/events/:id/rules
 */
export const updateEventRules = async (req, res) => {
    try {
        const event = await findAdminEvent(req.params.id, req.user);
        if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

        const { rules, eligibility, gender, schedule, requiresMusic, requiresPdf } = req.body;

        if (rules !== undefined) event.rules = rules;
        if (eligibility !== undefined) event.eligibility = eligibility;
        if (gender !== undefined) event.gender = gender;
        if (schedule !== undefined) event.schedule = schedule;
        if (requiresMusic !== undefined) event.requiresMusic = requiresMusic;
        if (requiresPdf !== undefined) event.requiresPdf = requiresPdf;

        await event.save();
        res.status(200).json({ message: 'Rules & Details updated', event });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/admin/events/:id/submit
 * Finalize draft and submit for super-admin verification.
 */
export const submitEvent = async (req, res) => {
    try {
        const event = await findAdminEvent(req.params.id, req.user);
        if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

        if (!event.isDraft) {
            return res.status(400).json({ message: 'Event is already submitted' });
        }

        // Validate required sections before submitting
        const required = {
            category: event.category,
            eventType: event.eventType,
            participationType: event.participationType
        };

        const missingFields = Object.entries(required)
            .filter(([, v]) => !v)
            .map(([k]) => k);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Please complete all required sections before submitting',
                missingFields
            });
        }

        event.isDraft = false;
        event.isVerified = false; // Need super-admin approval
        event.rejectionReason = null;
        await event.save();

        res.status(200).json({ message: 'Event submitted for verification successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * DELETE /api/admin/events/:id
 * Admin deletes an event they coordinate.
 * Super-admins can delete any event.
 */
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid event ID' });
        }

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const isSuperAdmin = req.user.role === 'super-admin';
        const isCoordinator = event.coordinators.some(
            (c) => c.toString() === req.user._id.toString()
        );
        if (!isSuperAdmin && !isCoordinator) {
            return res.status(403).json({ message: 'You are not a coordinator of this event' });
        }

        await Event.findByIdAndDelete(id);

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('deleteEvent error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/admin/events
 * Admin sees only their own events (where they are a coordinator).
 * Super-admin sees ALL events (use getAllEventsAdmin instead).
 * Query: ?page=1&limit=10&status=upcoming|live|past&isVerified=true|false
 */
export const getAdminEvents = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;

        const filter = { coordinators: req.user._id };

        if (req.query.status) {
            Object.assign(filter, buildStatusFilter(req.query.status));
        }
        if (req.query.isVerified !== undefined) {
            filter.isVerified = req.query.isVerified === 'true';
        }

        const [events, total] = await Promise.all([
            Event.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('coordinators', 'fullName email profilePic'),
            Event.countDocuments(filter),
        ]);

        res.status(200).json({
            events,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('getAdminEvents error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/admin/events/:id
 * Admin or super-admin views a single event by ID.
 * Admin must be a coordinator to view.
 */
export const getEventByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid event ID' });
        }

        const event = await Event.findById(id)
            .populate('coordinators', 'fullName email profilePic role')
            .populate('interestedStudents', 'fullName email profilePic');

        if (!event) return res.status(404).json({ message: 'Event not found' });

        const isSuperAdmin = req.user.role === 'super-admin';
        const isCoordinator = event.coordinators.some(
            (c) => c._id.toString() === req.user._id.toString()
        );
        if (!isSuperAdmin && !isCoordinator) {
            return res.status(403).json({ message: 'You are not a coordinator of this event' });
        }

        res.status(200).json({ event });
    } catch (error) {
        console.error('getEventByIdAdmin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  SUPER-ADMIN ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/events/all
 * Super-admin sees ALL events with full filter support.
 * Query: ?page=1&limit=10&status=upcoming|live|past&isVerified=true|false&category=Technical
 */
export const getAllEventsAdmin = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.status) {
            Object.assign(filter, buildStatusFilter(req.query.status));
        }
        if (req.query.isVerified !== undefined) {
            filter.isVerified = req.query.isVerified === 'true';
        }
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const [events, total] = await Promise.all([
            Event.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('coordinators', 'fullName email role'),
            Event.countDocuments(filter),
        ]);

        res.status(200).json({
            events,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('getAllEventsAdmin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/events/:id/verify
 * Super-admin approves or rejects an event.
 * Body: { isVerified: true|false, rejectionReason?: "string" }
 */
export const verifyEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified, rejectionReason } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid event ID' });
        }
        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ message: 'isVerified (boolean) is required' });
        }

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.isVerified = isVerified;
        event.rejectionReason = isVerified ? null : (rejectionReason ?? null);
        await event.save();

        res.status(200).json({
            message: isVerified ? 'Event verified and published.' : 'Event rejected.',
            event,
        });
    } catch (error) {
        console.error('verifyEvent error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC / STUDENT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/events
 * Public: returns only verified events.
 * Query: ?status=upcoming|live|past&category=Technical&page=1&limit=10
 *
 * Status mapping:
 *   upcoming      → no eventStartDate set yet  (interest-check phase, shows like/interest btn)
 *   live          → eventStartDate set, event not yet over  (shows countdown timer)
 *   past          → eventEndDate in the past
 */
export const getPublicEvents = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 12, 50);
        const skip = (page - 1) * limit;

        const filter = { isVerified: true };

        if (req.query.status) {
            Object.assign(filter, buildStatusFilter(req.query.status));
        }
        if (req.query.category) filter.category = req.query.category;
        if (req.query.eventType) filter.eventType = req.query.eventType;
        if (req.query.participationType) filter.participationType = req.query.participationType;

        const [events, total] = await Promise.all([
            Event.find(filter)
                .sort({ registrationStart: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-rejectionReason')
                .populate('coordinators', 'fullName profilePic'),
            Event.countDocuments(filter),
        ]);

        const processedEvents = events.map(event => {
            const eventObj = event.toObject();
            if (req.user) {
                eventObj.isInterested = event.interestedStudents.some(
                    id => id.toString() === req.user._id.toString()
                );
            } else {
                eventObj.isInterested = false;
            }
            // We can now remove interestedStudents from the response if we want to save bandwidth, 
            // but we need it for calculating isInterested above.
            delete eventObj.interestedStudents;
            return eventObj;
        });

        res.status(200).json({
            events: processedEvents,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('getPublicEvents error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/events/:slug
 * Public: single verified event by slug.
 */
export const getPublicEventBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const event = await Event.findOne({ slug, isVerified: true })
            .populate('coordinators', 'fullName email profilePic');

        if (!event) return res.status(404).json({ message: 'Event not found' });

        res.status(200).json({ event });
    } catch (error) {
        console.error('getPublicEventBySlug error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/events/:id/interest
 * Authenticated student expresses interest in an upcoming event.
 */
export const showInterest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid event ID' });
        }

        const event = await Event.findOne({ _id: id, isVerified: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if user is onboarded and verified (for students)
        if (!req.user.isOnboarded) {
            return res.status(403).json({
                message: 'Please complete your profile (onboarding) before showing interest in events.'
            });
        }
        if (req.user.role === 'student' && !req.user.isVerified) {
            return res.status(403).json({
                message: 'Your account is pending verification by the admin. You can show interest once verified.'
            });
        }

        // Interest only makes sense for upcoming events
        if (event.status !== 'upcoming') {
            return res.status(400).json({
                message: `Interest can only be shown for upcoming events. This event is currently ${event.status}.`,
            });
        }

        const index = event.interestedStudents.findIndex(
            (s) => s.toString() === req.user._id.toString()
        );

        let isInterested = false;
        if (index === -1) {
            event.interestedStudents.push(req.user._id);
            isInterested = true;
        } else {
            event.interestedStudents.splice(index, 1);
            isInterested = false;
        }

        await event.save();

        res.status(200).json({
            message: isInterested ? 'Interest recorded' : 'Interest removed',
            isInterested,
            interestCount: event.interestedStudents.length,
        });
    } catch (error) {
        console.error('showInterest error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * DELETE /api/events/:id/interest
 * Authenticated student removes their interest.
 */
export const removeInterest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid event ID' });
        }

        const event = await Event.findOne({ _id: id, isVerified: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const index = event.interestedStudents.findIndex(
            (s) => s.toString() === req.user._id.toString()
        );
        if (index === -1) {
            return res.status(404).json({ message: 'You have not shown interest in this event' });
        }

        event.interestedStudents.splice(index, 1);
        await event.save();

        res.status(200).json({
            message: 'Interest removed',
            interestCount: event.interestedStudents.length,
        });
    } catch (error) {
        console.error('removeInterest error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
