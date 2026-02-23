import { User } from "../models/user.model.js";

// ═════════════════════════════════════════════
// GET USER PROFILE - Single endpoint for all data
// ═════════════════════════════════════════════
export const getUserProfile = async (req, res) => {
    try {
        const user = req.user; // from auth middleware

        res.status(200).json({
            _id: user._id,
            email: user.email,

            // About section
            fullName: user.fullName,
            gender: user.gender,
            profilePic: user.profilePic,

            // College info section
            department: user.department,
            class: user.class,
            rollNo: user.rollNo,
            collegeFeeImg: user.collegeFeeImg,

            // Contact section
            phoneNumber: user.phoneNumber,
            links: user.links, // social media links

            // Status
            role: user.role,
            isOnboarded: user.isOnboarded,
            isVerified: user.isVerified,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
        });

    } catch (error) {
        console.log("Error in getUserProfile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ═════════════════════════════════════════════
// UPDATE PROFILE PICTURE
// ═════════════════════════════════════════════
export const updateProfilePicture = async (req, res) => {
    try {
        const user = req.user;
        const { profilePic } = req.body;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture URL is required" });
        }

        // Validate Cloudinary URL
        if (!profilePic.startsWith('https://res.cloudinary.com/')) {
            return res.status(400).json({ message: "Invalid image URL" });
        }

        user.profilePic = profilePic;
        await user.save();

        res.status(200).json({
            message: "Profile picture updated successfully",
            profilePic: user.profilePic
        });

    } catch (error) {
        console.log("Error in updateProfilePicture:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ═════════════════════════════════════════════
// UPDATE ABOUT INFO (Full Name, Gender)
// ═════════════════════════════════════════════
export const updateAboutInfo = async (req, res) => {
    try {
        const user = req.user;
        const { fullName, gender } = req.body;

        // Validation
        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ message: "Full name is required" });
        }

        if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
            return res.status(400).json({ message: "Invalid gender value" });
        }

        user.fullName = fullName.trim();
        if (gender) user.gender = gender;

        await user.save();

        res.status(200).json({
            message: "About info updated successfully",
            fullName: user.fullName,
            gender: user.gender
        });

    } catch (error) {
        console.log("Error in updateAboutInfo:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ═════════════════════════════════════════════
// UPDATE COLLEGE INFO (Department, Class, Roll No)
// ═════════════════════════════════════════════
export const updateCollegeInfo = async (req, res) => {
    try {
        const user = req.user;
        const { department, class: userClass, rollNo } = req.body;

        // Validation
        if (!department || !userClass || !rollNo) {
            return res.status(400).json({
                message: "Department, class, and roll number are required"
            });
        }

        const validDepartments = ['BCS', 'BCA', 'BBA', 'BCOM', 'BSC'];
        if (!validDepartments.includes(department)) {
            return res.status(400).json({
                message: `Invalid department. Must be one of: ${validDepartments.join(', ')}`
            });
        }

        const validClasses = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        if (!validClasses.includes(userClass)) {
            return res.status(400).json({
                message: `Invalid class. Must be one of: ${validClasses.join(', ')}`
            });
        }

        // Check if roll number already exists (exclude current user)
        const existingRollNo = await User.findOne({
            rollNo: rollNo.trim(),
            _id: { $ne: user._id }
        });

        if (existingRollNo) {
            return res.status(400).json({ message: "Roll number already exists" });
        }

        user.department = department;
        user.class = userClass;
        user.rollNo = rollNo.trim();

        await user.save();

        res.status(200).json({
            message: "College info updated successfully",
            department: user.department,
            class: user.class,
            rollNo: user.rollNo
        });

    } catch (error) {
        console.log("Error in updateCollegeInfo:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ═════════════════════════════════════════════
// UPDATE COLLEGE FEE IMAGE
// ═════════════════════════════════════════════
export const updateCollegeFeeImage = async (req, res) => {
    try {
        const user = req.user;
        const { collegeFeeImg } = req.body;

        if (!collegeFeeImg) {
            return res.status(400).json({ message: "Fee receipt URL is required" });
        }

        // Validate Cloudinary URL
        if (!collegeFeeImg.startsWith('https://res.cloudinary.com/')) {
            return res.status(400).json({ message: "Invalid image URL" });
        }

        user.collegeFeeImg = collegeFeeImg;
        // Reset verification when new fee receipt is uploaded
        user.isVerified = false;

        await user.save();

        res.status(200).json({
            message: "Fee receipt uploaded. Waiting for admin verification.",
            collegeFeeImg: user.collegeFeeImg,
            isVerified: user.isVerified
        });

    } catch (error) {
        console.log("Error in updateCollegeFeeImage:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ═════════════════════════════════════════════
// UPDATE CONTACT DETAILS (Phone, Links)
// ═════════════════════════════════════════════
export const updateContactDetails = async (req, res) => {
    try {
        const user = req.user;
        const { phoneNumber, links } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({
                message: "Please Provide Phone Number"
            });
        }
        // Phone number validation (optional field)
        if (phoneNumber) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phoneNumber)) {
                return res.status(400).json({
                    message: "Invalid phone number. Must be 10 digits."
                });
            }
            user.phoneNumber = phoneNumber;
        }

        // Links validation (optional field)
        if (links) {
            // Validate each link if provided
            const validLinks = {};

            if (links.linkedin) {
                if (!links.linkedin.startsWith('https://linkedin.com/') &&
                    !links.linkedin.startsWith('https://www.linkedin.com/')) {
                    return res.status(400).json({ message: "Invalid LinkedIn URL" });
                }
                validLinks.linkedin = links.linkedin;
            }

            if (links.github) {
                if (!links.github.startsWith('https://github.com/')) {
                    return res.status(400).json({ message: "Invalid GitHub URL" });
                }
                validLinks.github = links.github;
            }

            if (links.insta) {
                try {
                    new URL(links.insta);
                    validLinks.insta = links.insta;
                } catch {
                    return res.status(400).json({ message: "Invalid Insta URL" });
                }
            }

            user.links = validLinks;
        }

        await user.save();

        res.status(200).json({
            message: "Contact details updated successfully",
            phoneNumber: user.phoneNumber,
            links: user.links
        });

    } catch (error) {
        console.log("Error in updateContactDetails:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ═════════════════════════════════════════════
// COMPLETE ONBOARDING - Call this when ALL required sections are filled
// ═════════════════════════════════════════════
export const completeOnboarding = async (req, res) => {
    try {
        const user = req.user;

        if (user.isOnboarded) {
            return res.status(400).json({ message: "Already onboarded" });
        }

        // Check if all required fields are filled
        const requiredFields = {
            fullName: user.fullName,
            department: user.department,
            class: user.class,
            rollNo: user.rollNo,
            profilePic: user.profilePic,
            collegeFeeImg: user.collegeFeeImg
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "Please complete all required sections",
                missingFields
            });
        }

        user.isOnboarded = true;
        await user.save();

        res.status(200).json({
            message: "Onboarding completed! Waiting for admin verification.",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isOnboarded: user.isOnboarded,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.log("Error in completeOnboarding:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};