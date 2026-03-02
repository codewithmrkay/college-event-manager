// store/event.store.js
import { create } from "zustand";
import * as eventServices from "../services/event.services";

export const useEventStore = create((set, get) => ({
    // State
    events: [],               // List of events (public/admin)
    currentEvent: null,       // Currently viewed/edited event
    pagination: null,         // Pagination data from list endpoints
    loading: false,
    error: null,
    success: null,

    // UI Helpers
    clearError: () => set({ error: null }),
    clearSuccess: () => set({ success: null }),
    clearMessages: () => set({ error: null, success: null }),
    resetState: () => set({
        events: [],
        currentEvent: null,
        pagination: null,
        loading: false,
        error: null,
        success: null
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    //  PUBLIC ACTIONS
    // ─────────────────────────────────────────────────────────────────────────────

    fetchPublicEvents: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            const data = await eventServices.getPublicEvents(params);
            set({
                events: data.events,
                pagination: data.pagination,
                loading: false
            });
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch events";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    fetchPublicEventBySlug: async (slug) => {
        try {
            set({ loading: true, error: null });
            const data = await eventServices.getPublicEventBySlug(slug);
            set({ currentEvent: data.event, loading: false });
            return { success: true, data: data.event };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch event details";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    showInterest: async (eventId) => {
        try {
            set({ loading: true, error: null, success: null });
            const data = await eventServices.showInterest(eventId);

            // Update local state if currentEvent is loaded
            const { currentEvent } = get();
            if (currentEvent && currentEvent._id === eventId) {
                // Simplified optimistic update for interest
                set({ success: data.message, loading: false });
            } else {
                set({ success: data.message, loading: false });
            }
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to show interest";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    removeInterest: async (eventId) => {
        try {
            set({ loading: true, error: null, success: null });
            const data = await eventServices.removeInterest(eventId);
            set({ success: data.message, loading: false });
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to remove interest";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────────
    //  ADMIN ACTIONS
    // ─────────────────────────────────────────────────────────────────────────────

    fetchAdminEvents: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            const data = await eventServices.getAdminEvents(params);
            set({
                events: data.events,
                pagination: data.pagination,
                loading: false
            });
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch admin events";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    fetchEventByIdAdmin: async (id) => {
        try {
            set({ loading: true, error: null });
            const data = await eventServices.getEventByIdAdmin(id);
            set({ currentEvent: data.event, loading: false });
            return { success: true, data: data.event };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch event details";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    // ---- Event Creation / Update Steps ----

    createEventBasicInfo: async (formData) => {
        try {
            set({ loading: true, error: null, success: null });
            const data = await eventServices.createEventBasicInfo(formData);
            set({ success: data.message, loading: false });
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to create event draft";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    updateEventStep: async (id, step, formData) => {
        try {
            set({ loading: true, error: null, success: null });

            let data;
            switch (step) {
                case 'basic-info': data = await eventServices.updateEventBasicInfo(id, formData); break;
                case 'category': data = await eventServices.updateEventCategory(id, formData); break;
                case 'participation': data = await eventServices.updateEventParticipation(id, formData); break;
                case 'dates': data = await eventServices.updateEventDates(id, formData); break;
                case 'capacity': data = await eventServices.updateEventCapacity(id, formData); break;
                case 'media': data = await eventServices.updateEventMedia(id, formData); break;
                case 'rules': data = await eventServices.updateEventRules(id, formData); break;
                default: throw new Error("Invalid update step");
            }

            set({
                currentEvent: data.event, // Update local current event
                success: data.message,
                loading: false
            });
            return { success: true, data: data.event };
        } catch (err) {
            const errorMsg = err.response?.data?.message || `Failed to update ${step}`;
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    submitEvent: async (id) => {
        try {
            set({ loading: true, error: null, success: null });
            const data = await eventServices.submitEvent(id);
            set({
                currentEvent: data.event,
                success: data.message,
                loading: false
            });
            return { success: true, data: data.event };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to submit event";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    deleteEvent: async (id) => {
        try {
            set({ loading: true, error: null, success: null });
            const data = await eventServices.deleteEvent(id);

            // Remove from list if present
            const { events } = get();
            set({
                events: events.filter(e => e._id !== id),
                currentEvent: null,
                success: data.message,
                loading: false
            });
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to delete event";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────────
    //  SUPER-ADMIN ACTIONS
    // ─────────────────────────────────────────────────────────────────────────────

    fetchAllEventsAdmin: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            const data = await eventServices.getAllEventsAdmin(params);
            set({
                events: data.events,
                pagination: data.pagination,
                loading: false
            });
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch all events";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    },

    verifyEvent: async (id, payload) => {
        // payload: { isVerified: boolean, rejectionReason?: string }
        try {
            set({ loading: true, error: null, success: null });
            const data = await eventServices.verifyEvent(id, payload);

            // Update local currentEvent if viewing it
            const { currentEvent } = get();
            if (currentEvent && currentEvent._id === id) {
                set({ currentEvent: data.event });
            }

            set({ success: data.message, loading: false });
            return { success: true, data: data.event };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to verify event";
            set({ error: errorMsg, loading: false });
            return { success: false, error: errorMsg };
        }
    }

}));
