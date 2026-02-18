// store/useAuthStore.js
import { create } from "zustand";
import { login, logout, me, resendOTP, signup, verifyOTP } from "../services/auth.services";

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  success:null,
  email:null,
  signupUser: async (formData) => {
    try {
      set({ loading: true, error: null });

      const data = await signup(formData);
      console.log(data.email)
      set({
        email: data.email,
        loading: false,
      });

    } catch (err) {
      set({
        error: err.response?.data?.message || "Signup failed",
        loading: false,

      });
      throw err;
    }
  },
  verifyEmail: async (formData) => {
    try {
      set({ loading: true, error: null });

      const data = await verifyOTP(formData);
      console.log(data)
      set({
        user: data.user,
        loading: false,
      });

    } catch (err) {
      console.log(err)
      set({
        error: err.response?.data?.message || "verification failed",
        loading: false,

      });
      throw err;
    }
  },
  resendOtp: async (formData) => {
    try {
      set({ loading: true, error: null });

      const data = await resendOTP(formData);
      console.log(data)
      set({
        success: data?.message,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "verification failed",
        loading: false,
      });
      throw err;
    }
  },

  login: async (formData) => {
    try {
      set({ loading: true, error: null });

      const data = await login(formData);

      set({
        user: data.user,
        loading: false,
      });

      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false,

      });
      return false;
    }
  },

  getProfile: async () => {
    try {
      set({ loading: true, error: null });
      const data = await me();
      set({
        user: data,
        loading: false,
      });
      return true;
    } catch (err) {
      set({
        user: null,
        loading: false,
        error: null,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await logout();
      set({
        user: null,
        error: null,
      });
      return true;
    } catch (err) {
      set({
        user: null,
        error: null,
      });
      return true;
    }
  },
}));