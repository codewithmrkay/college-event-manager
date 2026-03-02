import api from "./api";

// Admins get their own events
export const getAdminEventsApi = async (params = {}) => {
    const { data } = await api.get("/admin/events", { params });
    return data;
};

// Super admins get all events
export const getAllEventsAdminApi = async (params = {}) => {
    const { data } = await api.get("/admin/events/all", { params });
    return data;
};

// Admin or super-admin views a single event by ID
export const getEventByIdAdminApi = async (id) => {
    const { data } = await api.get(`/admin/events/${id}`);
    return data;
};

// Super admin verify event
export const verifyEventApi = async (id, payload) => {
    const { data } = await api.patch(`/admin/events/${id}/verify`, payload);
    return data;
};

// Admin create basic info
export const createEventBasicInfoApi = async (payload) => {
    const { data } = await api.post(`/admin/events`, payload);
    return data;
};

// Admin update basic info
export const updateEventBasicInfoApi = async (id, payload) => {
    const { data } = await api.patch(`/admin/events/${id}/basic-info`, payload);
    return data;
};

// Update event sections
export const updateEventCategoryApi = async (id, payload) => {
    const { data } = await api.patch(`/admin/events/${id}/category`, payload);
    return data;
};

export const updateEventParticipationApi = async (id, payload) => {
    const { data } = await api.patch(`/admin/events/${id}/participation`, payload);
    return data;
};

export const updateEventDatesApi = async (id, payload) => {
    const { data } = await api.patch(`/admin/events/${id}/dates`, payload);
    return data;
};

export const updateEventCapacityApi = async (id, payload) => {
    const { data } = await api.patch(`/admin/events/${id}/capacity`, payload);
    return data;
};

export const updateEventMediaApi = async (id, payload) => {
    // If testing file upload with multer in future, might need formData header.
    // For now assuming a cloud URL or standard json config
    const { data } = await api.patch(`/admin/events/${id}/media`, payload);
    return data;
};

export const updateEventRulesApi = async (id, payload) => {
    const { data } = await api.patch(`/admin/events/${id}/rules`, payload);
    return data;
};
