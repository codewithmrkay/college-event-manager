import { create } from "zustand";
import {
    getAdminEventsApi,
    getAllEventsAdminApi,
    verifyEventApi,
    createEventBasicInfoApi,
    updateEventBasicInfoApi,
    updateEventCategoryApi,
    updateEventParticipationApi,
    updateEventDatesApi,
    updateEventCapacityApi,
    updateEventMediaApi,
    updateEventRulesApi,
    getEventByIdAdminApi,
    submitEventApi
} from "../services/admin.services";

export const useAdminEventStore = create((set, get) => ({
    events: [],
    currentEvent: null,
    pagination: null,
    loading: false,
    error: null,

    fetchAdminEvents: async (params) => {
        try {
            set({ loading: true, error: null });
            const data = await getAdminEventsApi(params);
            set({ events: data.events, pagination: data.pagination, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch admin events", loading: false });
        }
    },

    fetchAllEvents: async (params) => {
        try {
            set({ loading: true, error: null });
            const data = await getAllEventsAdminApi(params);
            set({ events: data.events, pagination: data.pagination, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch all events", loading: false });
        }
    },

    verifyEvent: async (id, isVerified, rejectionReason = null) => {
        try {
            set({ loading: true, error: null });
            await verifyEventApi(id, { isVerified, rejectionReason });
            // Optionally refetch or update state here
            set({ loading: false });
            // Optimistic update
            set((state) => ({
                events: state.events.map(ev =>
                    ev._id === id ? { ...ev, isVerified, rejectionReason: !isVerified ? rejectionReason : null } : ev
                )
            }));
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to verify event", loading: false });
            return false;
        }
    },

    fetchEventById: async (id) => {
        try {
            set({ loading: true, error: null });
            const data = await getEventByIdAdminApi(id);
            set({ currentEvent: data.event, loading: false });
            return data.event;
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch event", loading: false });
            return null;
        }
    },

    createBasicEvent: async (payload) => {
        try {
            set({ loading: true, error: null });
            const data = await createEventBasicInfoApi(payload);
            set({ currentEvent: data.event, loading: false }); // Store the newly created draft
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to create event", loading: false });
            return null;
        }
    },

    updateEventBasicInfo: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const data = await updateEventBasicInfoApi(id, payload);
            set({ currentEvent: data.event, loading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Update failed", loading: false });
            throw error;
        }
    },

    updateEventCategory: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const data = await updateEventCategoryApi(id, payload);
            set({ loading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Update failed", loading: false });
            throw error;
        }
    },

    updateEventParticipation: async (id, payload) => {
        try {
            set({ loading: true, error: null });

            // If solo, ensure sizes are null (frontend should handle this, but for safety)
            const finalPayload = { ...payload };
            if (payload.participationType === 'Solo') {
                finalPayload.minTeamSize = null;
                finalPayload.maxTeamSize = null;
            }

            const data = await updateEventParticipationApi(id, finalPayload);
            set({ currentEvent: data.event, loading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Update failed", loading: false });
            throw error;
        }
    },

    updateEventDates: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const data = await updateEventDatesApi(id, payload);
            set({ currentEvent: data.event, loading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Update failed", loading: false });
            throw error;
        }
    },

    updateEventCapacity: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const data = await updateEventCapacityApi(id, payload);
            set({ currentEvent: data.event, loading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Update failed", loading: false });
            throw error;
        }
    },

    updateEventMedia: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const data = await updateEventMediaApi(id, payload);
            set({ currentEvent: data.event, loading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Update failed", loading: false });
            throw error;
        }
    },

    updateEventRules: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const data = await updateEventRulesApi(id, payload);
            set({ currentEvent: data.event, loading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Update failed", loading: false });
            throw error;
        }
    },

    submitEvent: async (id) => {
        try {
            set({ loading: true, error: null });
            const data = await submitEventApi(id);
            // Mark the event as no longer a draft in store
            set({ currentEvent: data.event, loading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Submission failed", loading: false });
            throw error;
        }
    },

    resetCurrentEvent: () => {
        set({ currentEvent: null });
    }
}));
