import mongoose from 'mongoose';
import slugify from 'slugify';

// ─── Schedule Sub-Schema ────────────────────────────────────────────────────
const scheduleSchema = new mongoose.Schema({
    time: { type: String, required: true },       // e.g. "10:00 AM"
    activity: { type: String, required: true },   // e.g. "Opening Ceremony"
}, { _id: false });

// ─── Main Event Schema ──────────────────────────────────────────────────────
const eventSchema = new mongoose.Schema({

    // ── Basic Info ────────────────────────────────────────────────────────
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        // auto-generated from title if not provided (see pre-save hook)
    },

    // ── Category & Type ───────────────────────────────────────────────────
    category: {
        type: String,
        required: function () { return !this.isDraft; },
        enum: ['Technical', 'Cultural', 'Sports', 'Academic', 'Social', 'Other'],
    },
    eventType: {
        type: String,
        required: function () { return !this.isDraft; },
        enum: ['Competition', 'Workshop', 'Seminar', 'Festival', 'Conference', 'Exhibition', 'Other'],
    },

    // ── Participation ─────────────────────────────────────────────────────
    participationType: {
        type: String,
        required: function () { return !this.isDraft; },
        enum: ['Solo', 'Team', 'Both'],
        default: 'Solo',
    },
    minTeamSize: {
        type: Number,
        default: null,
        validate: {
            validator: function (v) {
                if (this.participationType === 'Solo') return v == null;
                return v == null || v >= 1;
            },
            message: 'minTeamSize must be >= 1 for team events',
        },
    },
    maxTeamSize: {
        type: Number,
        default: null,
        validate: {
            validator: function (v) {
                if (this.participationType === 'Solo') return v == null;
                if (v == null) return true;
                return v >= (this.minTeamSize || 1);
            },
            message: 'maxTeamSize must be >= minTeamSize',
        },
    },

    // ── Dates & Venue ─────────────────────────────────────────────────────
    registrationStart: {
        type: Date,
        default: null,
    },
    registrationEnd: {
        type: Date,
        default: null,
    },
    /**
     * eventStartDate = null  →  Date not decided yet   (status: "upcoming")
     * eventStartDate = future →  Date fixed, not started (status: "live")
     * eventEndDate   = past  →  Event is over           (status: "past")
     */
    eventStartDate: {
        type: Date,
        default: null,
    },
    eventEndDate: {
        type: Date,
        default: null,
    },
    venue: {
        type: String,
        trim: true,
        default: null,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },

    // ── Capacity & Fees ───────────────────────────────────────────────────
    maxParticipants: {
        type: Number,
        default: null,   // null = unlimited
    },
    registrationFee: {
        type: Number,
        default: 0,      // 0 = free
        min: 0,
    },
    prizeMoney: {
        type: Number,
        default: null,   // null = no prize money
        min: 0,
    },
    hasCertificate: {
        type: Boolean,
        default: false,  // true = certificate given to winner/participants
    },

    // ── Media ─────────────────────────────────────────────────────────────
    bannerImage: {
        type: String,    // Cloudinary URL
        default: null,
    },

    // ── Organizers / Coordinators ─────────────────────────────────────────
    coordinators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    // ── Rules & Details ───────────────────────────────────────────────────
    rules: {
        type: [String],
        default: [],
    },
    eligibility: {
        type: [String],
        default: [],
    },
    gender: {
        type: String,
        enum: ['All', 'Male', 'Female'],
        default: 'All',
    },
    schedule: {
        type: [scheduleSchema],
        default: [],
    },

    // ── Status & Visibility ───────────────────────────────────────────────
    /**
     * isDraft = true   →  Admin is still filling in sections (not yet submitted)
     * isDraft = false  →  Submitted for super-admin verification
     *
     * isVerified = false  →  Pending super-admin approval (hidden from public)
     * isVerified = true   →  Approved and visible on public website
     */
    isDraft: {
        type: Boolean,
        default: true,   // always starts as a draft when created
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    rejectionReason: {
        type: String,
        default: null,
    },
    isRegistrationOpen: {
        type: Boolean,
        default: false,
    },

    // ── Interest (for date-not-set / upcoming phase) ───────────────────────
    interestedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    // ── Stats (auto-maintained) ───────────────────────────────────────────
    totalRegistrations: {
        type: Number,
        default: 0,
    },
    currentParticipants: {
        type: Number,
        default: 0,
    },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// ─── Virtual: computed status ────────────────────────────────────────────────
/**
 * "upcoming" – eventStartDate not set (date TBD, interest-check phase)
 * "live"     – eventStartDate is set and is in the future (shows countdown)
 * "past"     – eventEndDate is set and already passed
 */
eventSchema.virtual('status').get(function () {
    const now = new Date();

    if (this.eventEndDate && this.eventEndDate < now) return 'past';
    if (this.eventStartDate && this.eventStartDate > now) return 'live';
    if (this.eventStartDate && this.eventStartDate <= now && (!this.eventEndDate || this.eventEndDate >= now)) return 'live';
    return 'upcoming'; // no start date set yet
});

// ─── Virtual: interest count ─────────────────────────────────────────────────
eventSchema.virtual('interestCount').get(function () {
    return this.interestedStudents ? this.interestedStudents.length : 0;
});

// ─── Pre-save: auto-generate slug from title ──────────────────────────────────
eventSchema.pre('save', async function () {
    if (!this.isModified('title') && this.slug) return;

    const base = slugify(this.title, { lower: true, strict: true });
    let slug = base;
    let count = 1;

    // Ensure slug uniqueness
    while (await mongoose.model('Event').exists({ slug, _id: { $ne: this._id } })) {
        slug = `${base}-${count++}`;
    }
    this.slug = slug;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
eventSchema.index({ slug: 1 });
eventSchema.index({ isVerified: 1, eventStartDate: 1, eventEndDate: 1 }); // public queries
eventSchema.index({ coordinators: 1 });                                    // admin "my events"

export const Event = mongoose.model('Event', eventSchema);
