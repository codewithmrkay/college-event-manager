import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({

    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // ── Team Info (only relevant for Team/Both events) ────────────────────
    teamName: {
        type: String,
        trim: true,
        default: null,
    },
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    // ── Payment ───────────────────────────────────────────────────────────
    paymentStatus: {
        type: String,
        enum: ['free', 'pending', 'confirmed'],
        default: 'free',
    },
    paymentProof: {
        type: String,   // Cloudinary URL of payment screenshot
        default: null,
    },

    // ── Status ────────────────────────────────────────────────────────────
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
        default: 'confirmed',
    },
    attended: {
        type: Boolean,
        default: false,
    },

    // ── Timestamps ────────────────────────────────────────────────────────
    registeredAt: {
        type: Date,
        default: Date.now,
    },

}, { timestamps: true });

// Prevent duplicate registrations for the same event by the same student
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
