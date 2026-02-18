import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";                     // built-in node module — generates random OTP
import setAuthCookies from "../utils/setAuthCookie.js";
import generateToken from "../utils/generateToken.js";
import sendOTPEmail from "../utils/sendmail.js";

// ─────────────────────────────────────────────
// SIGNUP — email + password route
// ─────────────────────────────────────────────
// User provides email and password
// We DON'T log them in yet — we send OTP first
// They must verify email before they can login
export const signUp = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Validate inputs
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({ message: "Provide a valid email" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // 2. Check if email is already taken
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already taken" });
        }

        // 3. Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();   // e.g. "482910"

        // 4. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create user — but isEmailVerified is false
        const user = new User({
            email,
            password: hashedPassword,
            verifyCode: otp,
            verifyCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),  // expires in 10 minutes
            isEmailVerified: false,
        });

        await user.save();

        // 6. Send OTP email
        await sendOTPEmail(email, otp);

        // 7. Respond — tell frontend to show OTP input screen
        res.status(201).json({
            message: "OTP sent to your email. Please verify.",
            email: user.email,   // frontend needs this to send back during verify
        });

    } catch (error) {
        console.log("Error in signUp:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────
// VERIFY OTP — user enters the 6 digit code
// ─────────────────────────────────────────────
// Only after this is successful, we set the JWT cookie
// and the user is actually logged in
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        // 1. Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // 2. Check if OTP has expired
        if (user.verifyCodeExpiresAt && user.verifyCodeExpiresAt < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Request a new one." });
        }

        // 3. Check if OTP matches
        if (user.verifyCode !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // 4. OTP is correct — mark email as verified
        user.isEmailVerified = true;
        user.verifyCode = undefined;              // clear the OTP, no longer needed
        user.verifyCodeExpiresAt = undefined;     // clear expiry too
        await user.save();

        // 5. Now generate token and set cookie — user is logged in
        const token = generateToken(user);
        setAuthCookies(res, token);

        res.status(200).json({
            message: "Email verified successfully",
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                isOnboarded: user.isOnboarded,
            },
        });

    } catch (error) {
        console.log("Error in verifyOTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────
// RESEND OTP — if user didn't get the email or it expired
// ─────────────────────────────────────────────
export const resendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        // Generate new OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        user.verifyCode = otp;
        user.verifyCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);  // fresh 10 minutes
        await user.save();

        await sendOTPEmail(email, otp);

        res.status(200).json({ message: "New OTP sent to your email" });

    } catch (error) {
        console.log("Error in resendOTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────
// LOGIN — email + password route
// ─────────────────────────────────────────────
// Only works if email is already verified
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // 1. Find user and include password field (it's excluded by default usually)
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 2. Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(400).json({
                message: "Email not verified. Please check your inbox.",
                email: user.email,   // send back email so frontend can show resend option
            });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 4. All good — generate token and set cookie
        const token = generateToken(user);
        setAuthCookies(res, token);

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                isOnboarded: user.isOnboarded,
            },
        });

    } catch (error) {
        console.log("Error in login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────
// GOOGLE AUTH CALLBACK — passport already did the work
// ─────────────────────────────────────────────
// Passport calls our strategy, finds/creates the user,
// and puts the user on req.user.
// This function just creates the JWT and sends it.
export const googleAuthCallback = async (req, res) => {
    try {
        const user = req.user;   // passport put this here

        if (!user) {
            return res.redirect("http://localhost:3000/login?error=auth_failed");
        }

        // Generate JWT
        const token = generateToken(user);

        // Set cookie
        setAuthCookies(res, token);

        // Redirect to frontend
        // isOnboarded tells frontend whether to show onboarding or dashboard
        if (!user.isOnboarded) {
            res.redirect("http://localhost:3000/onboarding");
        } else {
            res.redirect("http://localhost:3000/");
        }

    } catch (error) {
        console.log("Error in googleAuthCallback:", error);
        res.redirect("http://localhost:3000/login?error=server_error");
    }
};

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export const logout = async (req, res) => {
    try {
        // Clear the JWT cookie by setting it to empty and expiring immediately
        res.cookie("jwt", "", {
            httpOnly: true,
            expires: new Date(0),
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        console.log("Error in logout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

