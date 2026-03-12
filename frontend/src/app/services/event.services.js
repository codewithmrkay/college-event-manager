// services/event.services.js
import api from "./api";

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC / STUDENT SERVICES
// ─────────────────────────────────────────────────────────────────────────────

// Get public events
export const getPublicEvents = async (params) => {
    const res = await api.get("/events", { params });
    return res.data;
};

// Get single public event by slug
export const getPublicEventBySlug = async (slug) => {
    const res = await api.get(`/events/${slug}`);
    console.log(slug)
    return res.data;
};

// Show interest in an event
export const showInterest = async (id) => {
    const res = await api.post(`/events/${id}/interest`);
    return res.data;
};

// Remove interest from an event
export const removeInterest = async (id) => {
    const res = await api.delete(`/events/${id}/interest`);
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN SERVICES
// ─────────────────────────────────────────────────────────────────────────────

// Get admin's events
export const getAdminEvents = async (params) => {
    const res = await api.get("/admin/events", { params });
    return res.data;
};

// Get single admin event by ID
export const getEventByIdAdmin = async (id) => {
    const res = await api.get(`/admin/events/${id}`);
    return res.data;
};

// Create a new event draft (Basic Info)
export const createEventBasicInfo = async (data) => {
    const res = await api.post("/admin/events", data);
    return res.data;
};

// Update basic info
export const updateEventBasicInfo = async (id, data) => {
    const res = await api.patch(`/admin/events/${id}/basic-info`, data);
    return res.data;
};

// Update category
export const updateEventCategory = async (id, data) => {
    const res = await api.patch(`/admin/events/${id}/category`, data);
    return res.data;
};

// Update participation
export const updateEventParticipation = async (id, data) => {
    const res = await api.patch(`/admin/events/${id}/participation`, data);
    return res.data;
};

// Update dates
export const updateEventDates = async (id, data) => {
    const res = await api.patch(`/admin/events/${id}/dates`, data);
    return res.data;
};

// Update capacity
export const updateEventCapacity = async (id, data) => {
    const res = await api.patch(`/admin/events/${id}/capacity`, data);
    return res.data;
};

// Update media
export const updateEventMedia = async (id, data) => {
    const res = await api.patch(`/admin/events/${id}/media`, data);
    return res.data;
};

// Update rules
export const updateEventRules = async (id, data) => {
    const res = await api.patch(`/admin/events/${id}/rules`, data);
    return res.data;
};

// Submit event for verification
export const submitEvent = async (id) => {
    const res = await api.post(`/admin/events/${id}/submit`);
    return res.data;
};

// Delete event
export const deleteEvent = async (id) => {
    const res = await api.delete(`/admin/events/${id}`);
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
//  SUPER-ADMIN SERVICES
// ─────────────────────────────────────────────────────────────────────────────

// Get all events (super-admin)
export const getAllEventsAdmin = async (params) => {
    const res = await api.get("/admin/events/all", { params });
    return res.data;
};

// Verify event (super-admin)
export const verifyEvent = async (id, data) => {
    const res = await api.patch(`/admin/events/${id}/verify`, data);
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
//  REGISTRATION SERVICES (Student)
// ─────────────────────────────────────────────────────────────────────────────

// Apply to an event
export const applyToEvent = async (eventId) => {
    const res = await api.post(`/events/${eventId}/apply`);
    return res.data;
};

// Get student's own applications
export const getMyApplications = async () => {
    const res = await api.get('/registrations/my');
    return res.data;
};

// Cancel an application
export const cancelApplication = async (registrationId) => {
    const res = await api.delete(`/registrations/${registrationId}/cancel`);
    return res.data;
};

// ─── Admin Registration Services ─────────────────────────────────────────────

/**
 * Admin: Fetch all participants for an event
 */
export const getEventParticipants = async (eventId) => {
    const res = await api.get(`/admin/events/${eventId}/participants`);
    return res.data;
};

/**
 * Admin: Mark attendance for a student
 */
export const markAttendance = async (registrationId, attended) => {
    const res = await api.patch(`/admin/registrations/${registrationId}/attendance`, { attended });
    return res.data;
};


