import express from "express";
import passport from 'passport'
import { googleAuthCallback, login, logout, resendOTP, signUp, verifyOTP } from "../controllers/auth.controller.js";
export const authRoute = express.Router()

authRoute.post('/signup',signUp)
authRoute.post("/verify-otp", verifyOTP);           
authRoute.post("/resend-otp", resendOTP);   
authRoute.post('/login',login)

authRoute.get("/google", passport.authenticate("google", { scope: ["profile", "email"] ,session: false }));
authRoute.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login"  ,session: false }), googleAuthCallback);

authRoute.post('/logout',logout)


 