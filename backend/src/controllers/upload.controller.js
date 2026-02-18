import cloudinary from "../config/cloudinary.config.js";

// ─────────────────────────────────────────────
// GET UPLOAD SIGNATURE
// ─────────────────────────────────────────────
// This generates a "permission slip" for the frontend to upload directly to Cloudinary
// Frontend calls this first, gets the signature, then uploads to Cloudinary
export const getUploadSignature = async (req, res) => {
    try {
        const { folder } = req.body;  // e.g., 'profiles' or 'fee-receipts'
        
        // Validate folder name (security — prevent uploading to random folders)
        const allowedFolders = ['profiles', 'fee-receipts'];
        if (!allowedFolders.includes(folder)) {
            return res.status(400).json({ message: "Invalid folder name" });
        }
        
        // Create timestamp (current time in seconds)
        const timestamp = Math.round(Date.now() / 1000);
        
        // Generate signature using Cloudinary's utility
        // This proves the upload is authorized by your backend
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp: timestamp,
                folder: `college-event-manager/${folder}`,  // full folder path
            },
            process.env.CLOUDINARY_API_SECRET  // secret key — only backend knows this
        );
        
        // Send back everything frontend needs to upload
        res.status(200).json({
            signature: signature,
            timestamp: timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder: `college-event-manager/${folder}`
        });
        
    } catch (error) {
        console.log("Error in getUploadSignature:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};