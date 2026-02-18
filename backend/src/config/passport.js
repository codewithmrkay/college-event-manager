
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // profile = what Google sent back about the user
                const googleId = profile.id;
                const email = profile.emails[0].value;
                const fullName = profile.displayName;
                const profilePic = profile.photos[0].value;

                // Check if user already exists by googleId
                let user = await User.findOne({ googleId });

                if (user) {
                    // User exists — just pass them along, login will happen
                    return done(null, user);
                }

                // No user with this googleId — check if email already exists
                // (maybe they signed up with email+password before)
                user = await User.findOne({ email });

                if (user) {
                    // Email exists but no googleId linked
                    // Link Google to their existing account
                    user.googleId = googleId;
                    user.profilePic = user.profilePic || profilePic;
                    user.fullName = user.fullName || fullName;
                    user.isEmailVerified = true; // Google already verified this email
                    await user.save();
                    return done(null, user);
                }

                // Completely new user — create account
                // Google users don't need password or verifyCode
                // isEmailVerified is true because Google verified it
                user = new User({
                    email,
                    googleId,
                    fullName,
                    profilePic,
                    isEmailVerified: true,  // Google already verified
                    // no password, no verifyCode needed
                });

                await user.save();
                return done(null, user);

            } catch (error) {
                return done(error);
            }
        }
    )
);

// Serialize — saves user id into the session
passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});

// Deserialize — fetches full user from DB using that id
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;