// middleware/protectRoute.js
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
    try {

        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decode.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("error in protectRoute", error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }

        res.status(401).json({ message: "Not authenticated" });
    }
};

export default protectRoute;

export const optionalProtect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return next();
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decode.userId).select("-password");
        if (user) {
            req.user = user;
        }
        next();
    } catch (error) {
        // If token is invalid or user not found, just proceed without req.user
        next();
    }
};

/**
 * requireRole(...roles)
 * Factory middleware — must be used AFTER protectRoute (req.user must exist).
 * Usage: router.post('/route', protectRoute, requireRole('admin', 'super-admin'), handler)
 */
export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
};
