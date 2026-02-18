// services/auth.services.js
import api from "./api";

export const getProfile = async () => {
  const res = await api.get("/user/profile");
  return res.data;
};

// Update profile picture
export const updateProfilePicture = async (data) => {
  const res = await api.patch("/user/profile-picture", data);
  return res.data;
};

// Update about info (full name, gender)
export const updateAboutInfo = async (data) => {
  const res = await api.patch("/user/about", data);
  return res.data;
};

// Update college info (department, class, roll no)
export const updateCollegeInfo = async (data) => {
  const res = await api.patch("/user/college-info", data);
  return res.data;
};

// Update college fee image
export const updateCollegeFeeImage = async (data) => {
  const res = await api.patch("/user/college-fee", data);
  return res.data;
};

// Update contact details (phone, links)
export const updateContactDetails = async (data) => {
  const res = await api.patch("/user/contact", data);
  return res.data;
};

// Complete onboarding
export const completeOnboarding = async () => {
  const res = await api.post("/user/complete-onboarding");
  return res.data;
};

// Get Cloudinary upload signature
export const getUploadSignature = async (data) => {
  const res = await api.post("/upload/signature", data);
  return res.data;
};