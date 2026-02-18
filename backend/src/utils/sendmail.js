import nodemailer from "nodemailer";

// This creates a connection to Gmail using your app password
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,   // your gmail address
        pass: process.env.EMAIL_PASS,   // your 16 character app password
    },
});

// This function sends the OTP email
// We call it like: sendOTPEmail("rahul@gmail.com", "482910")
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"MangoDolly" <${process.env.EMAIL_USER}>`,  // who is sending
        to: email,                                              // who receives
        subject: "Your Verification Code",                      // email subject
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                <h2 style="text-align: center;">Your OTP Code</h2>
                <p style="text-align: center; color: #555;">Use this code to verify your email address.</p>
                <div style="text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
                </div>
                <p style="text-align: center; color: #888; font-size: 14px;">This code expires in 10 minutes.</p>
                <p style="text-align: center; color: #888; font-size: 14px;">If you didn't request this code, ignore this email.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);  // actually sends the email
};

export default sendOTPEmail;