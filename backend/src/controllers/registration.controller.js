import { Registration } from '../models/registration.model.js';
import { Event } from '../models/event.model.js';

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/events/:id/apply
//  Student applies to an event
// ─────────────────────────────────────────────────────────────────────────────
export const applyEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const studentId = req.user._id;

        // 1. Load event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // 2. Verify it's a public, open event
        if (!event.isVerified) {
            return res.status(400).json({ message: 'Event is not yet verified/published' });
        }
        if (!event.isRegistrationOpen) {
            return res.status(400).json({ message: 'Registration is currently closed for this event' });
        }

        // 3. Check capacity
        if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
            return res.status(400).json({ message: 'Event is full. No seats available.' });
        }

        // 4. Prevent duplicate registration
        const existing = await Registration.findOne({ event: eventId, student: studentId });
        if (existing) {
            if (existing.status === 'cancelled') {
                // Allow re-registration after cancellation
                existing.status = 'confirmed';
                await existing.save();
                // Increment counters
                await Event.findByIdAndUpdate(eventId, {
                    $inc: { currentParticipants: 1, totalRegistrations: 1 },
                });
                return res.status(200).json({ message: 'Re-registered successfully', registration: existing });
            }
            return res.status(400).json({ message: 'You have already applied for this event' });
        }

        // 5. Create registration
        const registration = new Registration({
            event: eventId,
            student: studentId,
            status: 'confirmed', // Instant registration as requested
            paymentStatus: event.registrationFee === 0 ? 'free' : 'pending',
        });
        await registration.save();

        // 6. Update event counters
        await Event.findByIdAndUpdate(eventId, {
            $inc: { currentParticipants: 1, totalRegistrations: 1 },
        });

        res.status(201).json({ message: 'Successfully applied for the event!', registration });
    } catch (error) {
        console.error('applyEvent error:', error);
        // MongoDB duplicate key (race condition)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already applied for this event' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/registrations/my
//  Student fetches their own applications
// ─────────────────────────────────────────────────────────────────────────────
export const getMyApplications = async (req, res) => {
    try {
        const registrations = await Registration.find({ student: req.user._id })
            .populate('event', 'title slug bannerImage eventStartDate eventEndDate category eventType venue isOnline registrationFee isVerified isRegistrationOpen maxParticipants currentParticipants hasCertificate prizeMoney')
            .sort({ registeredAt: -1 });

        res.status(200).json({ registrations });
    } catch (error) {
        console.error('getMyApplications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/registrations/:registrationId/cancel
//  Student cancels their own application
// ─────────────────────────────────────────────────────────────────────────────
export const cancelApplication = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const studentId = req.user._id;

        const registration = await Registration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Ensure the requester owns this registration
        if (registration.student.toString() !== studentId.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this registration' });
        }

        if (registration.status === 'cancelled') {
            return res.status(400).json({ message: 'Registration is already cancelled' });
        }

        // Set cancelled, decrement participant count
        registration.status = 'cancelled';
        await registration.save();

        await Event.findByIdAndUpdate(registration.event, {
            $inc: { currentParticipants: -1 },
        });

        res.status(200).json({ message: 'Registration cancelled successfully', registration });
    } catch (error) {
        console.error('cancelApplication error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN: GET /api/admin/events/:id/participants
//  Fetch all students registered for an event
// ─────────────────────────────────────────────────────────────────────────────
export const getEventParticipants = async (req, res) => {
    try {
        const { id } = req.params;
        const participants = await Registration.find({ event: id })
            .populate('student', 'fullName email rollNo department class profilePic gender phoneNumber')
            .sort({ registeredAt: -1 });

        res.status(200).json({ participants });
    } catch (error) {
        console.error('getEventParticipants error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN: PATCH /api/admin/registrations/:registrationId/attendance
//  Mark a student's attendance for an event
// ─────────────────────────────────────────────────────────────────────────────
export const markAttendance = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { attended } = req.body; // true or false

        const registration = await Registration.findByIdAndUpdate(
            registrationId,
            { attended },
            { new: true }
        ).populate('student', 'fullName');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.status(200).json({
            message: `Attendance marked as ${attended ? 'Present' : 'Absent'} for ${registration.student.fullName}`,
            registration
        });
    } catch (error) {
        console.error('markAttendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
