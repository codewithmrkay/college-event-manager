// store/userStore.js
import { create } from "zustand";
import {
  getProfile,
  updateProfilePicture,
  updateAboutInfo,
  updateCollegeInfo,
  updateCollegeFeeImage,
  updateContactDetails,
  completeOnboarding,
  getUploadSignature
} from "../services/user.services";

export const useUserStore = create((set) => ({
  // State
  user: null,
  loading: false,
  error: null,
  success: null,
  signature: null,

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),
  clearMessages: () => set({ error: null, success: null }),

  getProfile: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getProfile();
      set({ user: data, loading: false });
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to get profile";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateProfilePicture: async (profilePic) => {
    try {
      set({ loading: true, error: null, success: null });
      const data = await updateProfilePicture({ profilePic });

      set((state) => ({
        user: { ...state.user, profilePic: data.profilePic },
        success: data.message,
        loading: false
      }));

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update profile picture";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateAboutInfo: async (formData) => {
    try {
      set({ loading: true, error: null, success: null });
      const data = await updateAboutInfo(formData);

      set((state) => ({
        user: {
          ...state.user,
          fullName: data.fullName,
          gender: data.gender
        },
        success: data.message,
        loading: false
      }));

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update about info";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update college info
  updateCollegeInfo: async (formData) => {
    try {
      set({ loading: true, error: null, success: null });
      const data = await updateCollegeInfo(formData);

      set((state) => ({
        user: {
          ...state.user,
          department: data.department,
          class: data.class,
          rollNo: data.rollNo
        },
        success: data.message,
        loading: false
      }));

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update college info";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update college fee image
  updateCollegeFeeImage: async (collegeFeeImg) => {
    try {
      set({ loading: true, error: null, success: null });
      const data = await updateCollegeFeeImage({ collegeFeeImg });

      set((state) => ({
        user: {
          ...state.user,
          collegeFeeImg: data.collegeFeeImg,
          isVerified: data.isVerified // Reset to false
        },
        success: data.message,
        loading: false
      }));

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update fee receipt";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update contact details
  updateContactDetails: async (formData) => {
    try {
      set({ loading: true, error: null, success: null });
      const data = await updateContactDetails(formData);

      set((state) => ({
        user: {
          ...state.user,
          phoneNumber: data.phoneNumber,
          links: data.links
        },
        success: data.message,
        loading: false
      }));

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update contact details";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Complete onboarding
  completeOnboarding: async () => {
    try {
      set({ loading: true, error: null, success: null });
      const data = await completeOnboarding();

      set((state) => ({
        user: { ...state.user, isOnboarded: true },
        success: data.message,
        loading: false
      }));

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to complete onboarding";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get upload signature
  getuploadsign: async (formData) => {
    try {
      set({ loading: true, error: null });
      const data = await getUploadSignature(formData);
      set({ signature: data, loading: false });
      return { success: true, data };
    } catch (err) {
      console.log(err)
      const errorMessage = err.response?.data?.message || "Failed to get signature";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Reset store
  reset: () => set({
    user: null,
    loading: false,
    error: null,
    success: null,
    signature: null
  }),
}));