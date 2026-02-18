import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { completeOnboarding, getUserProfile, updateAboutInfo, updateCollegeFeeImage, updateCollegeInfo, updateContactDetails, updateProfilePicture } from "../controllers/user.controller.js";


const router = express.Router();

// All routes require authentication
router.use(protectRoute);

router.get("/profile", getUserProfile);

// ── UPDATE Profile Sections ──
// PATCH /api/user/profile-picture
router.patch("/profile-picture", updateProfilePicture);

// PATCH /api/user/about
router.patch("/about", updateAboutInfo);

// PATCH /api/user/college-info
router.patch("/college-info", updateCollegeInfo);

// PATCH /api/user/college-fee
router.patch("/college-fee", updateCollegeFeeImage);

// PATCH /api/user/contact
router.patch("/contact", updateContactDetails);

// ── Complete Onboarding ──
// POST /api/user/complete-onboarding
router.post("/complete-onboarding", completeOnboarding);


export default router;