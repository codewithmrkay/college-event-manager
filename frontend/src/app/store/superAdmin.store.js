import { create } from "zustand";
import {
    getStudentStatsApi,
    getStudentsApi,
    verifyStudentApi,
    getAdminsApi,
    getSuperAdminEventsApi,
    getSuperAdminEventByIdApi,
    verifySuperAdminEventApi,
} from "../services/superAdmin.services";

export const useSuperAdminStore = create((set, get) => ({
    // ── Student stats ──────────────────────────────────────────────────
    stats: null,
    adminCount: 0,

    // ── Student list ───────────────────────────────────────────────────
    students: [],
    studentPagination: null,

    // ── Events ─────────────────────────────────────────────────────────
    events: [],
    eventPagination: null,
    currentEvent: null,

    loading: false,
    error: null,

    // ── Actions ────────────────────────────────────────────────────────

    fetchStats: async () => {
        try {
            set({ loading: true, error: null });
            const [statsData, adminsData] = await Promise.all([
                getStudentStatsApi(),
                getAdminsApi({ limit: 1 }),
            ]);
            set({
                stats: statsData.stats,
                adminCount: adminsData.pagination?.total ?? 0,
                loading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch stats", loading: false });
        }
    },

    fetchStudents: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            const data = await getStudentsApi(params);
            set({ students: data.students, studentPagination: data.pagination, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch students", loading: false });
        }
    },

    verifyStudent: async (id, isVerified) => {
        try {
            set({ loading: true, error: null });
            await verifyStudentApi(id, isVerified);
            // Optimistic update in list
            set((state) => ({
                students: state.students.map((s) =>
                    s._id === id ? { ...s, isVerified } : s
                ),
                loading: false,
            }));
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || "Verification failed", loading: false });
            throw error;
        }
    },

    fetchEvents: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            const data = await getSuperAdminEventsApi(params);
            set({ events: data.events, eventPagination: data.pagination, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch events", loading: false });
        }
    },

    fetchEventById: async (id) => {
        try {
            set({ loading: true, error: null, currentEvent: null });
            const data = await getSuperAdminEventByIdApi(id);
            set({ currentEvent: data.event, loading: false });
            return data.event;
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch event", loading: false });
            return null;
        }
    },

    verifyEvent: async (id, isVerified, rejectionReason = null) => {
        try {
            set({ loading: true, error: null });
            await verifySuperAdminEventApi(id, { isVerified, rejectionReason });
            // Optimistic update
            set((state) => ({
                events: state.events.map((ev) =>
                    ev._id === id
                        ? { ...ev, isVerified, rejectionReason: !isVerified ? rejectionReason : null }
                        : ev
                ),
                currentEvent:
                    state.currentEvent?._id === id
                        ? { ...state.currentEvent, isVerified, rejectionReason: !isVerified ? rejectionReason : null }
                        : state.currentEvent,
                loading: false,
            }));
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || "Event verification failed", loading: false });
            throw error;
        }
    },
}));
