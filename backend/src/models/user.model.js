import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    verifyCode: {
        type: String,
        required: function () {
            return !this.googleId && !this.isEmailVerified;
        }
    },
    verifyCodeExpiresAt: {
        type: Date,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        required: function () { return !this.googleId; }
    },
    password: {
        type: String,
        required: function () { return !this.googleId; },
        select: false  // Don't include password in queries by default
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },

    // Onboarding fields
    fullName: {
        type: String,
        trim: true,
        required: function () { return this.isOnboarded; }  // required only after onboarding
    },
    gender: {
        type: String,
        trim: true,
        default: "male"
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    profilePic: {
        type: String  // Cloudinary URL
    },

    // Student-specific fields
    department: {
        type: String,
        enum: ['BCS', 'BCA', 'BBA', 'BCOM', 'BSC'],
        required: function () { return this.isOnboarded && this.role === 'student'; }
    },
    class: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        required: function () { return this.isOnboarded && this.role === 'student'; }
    },
    rollNo: {
        type: String,
        sparse: true,
        trim: true,
        required: function () { return this.isOnboarded && this.role === 'student'; }
    },
    collegeFeeImg: {
        type: String  // Cloudinary URL of fee receipt
    },
    feeReceiptNo: {
        type: String,
        trim: true,
        default: null,
        // The check/DD/receipt number printed on the college fee receipt.
        // Super-admin cross-references this with the Excel import.
    },
    links: {
        linkedin: { type: String },
        github: { type: String },
        portfolio: { type: String },
    },
    // Status fields
    role: {
        type: String,
        enum: ['student', 'admin', 'super-admin'],
        default: 'student'
    },
    // Admin-specific: which event categories this admin manages
    // e.g. ['Technical', 'Cultural'] — assigned by super-admin on promotion
    adminCategory: {
        type: [String],
        enum: ['Technical', 'Cultural', 'Sports', 'Academic', 'Social', 'Other'],
        default: [],
    },
    adminCategoryDescription: {
        type: String,
        trim: true,
        default: null,
    },
    isOnboarded: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false  // Super-admin approval for students (after checking fee receipt)
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);