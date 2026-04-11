import api from "./api";

// ── Student Stats ──────────────────────────────────────────────────────────
export const getStudentStatsApi = async () => {
    const { data } = await api.get("/super-admin/students/stats");
    return data;
};

// ── Student List ───────────────────────────────────────────────────────────
// params: { search, dept, class, verified, page, limit }
export const getStudentsApi = async (params = {}) => {
    const { data } = await api.get("/super-admin/students", { params });
    return data;
};

// ── Verify / Revoke Student ────────────────────────────────────────────────
export const verifyStudentApi = async (id, isVerified) => {
    const { data } = await api.patch(`/super-admin/students/${id}/verify`, { isVerified });
    return data;
};

// ── Admin Count ────────────────────────────────────────────────────────────
export const getAdminsApi = async (params = {}) => {
    const { data } = await api.get("/super-admin/admins", { params });
    return data;
};

// ── Super-Admin Events ─────────────────────────────────────────────────────
// params: { status, isVerified, category, page, limit }
export const getSuperAdminEventsApi = async (params = {}) => {
    const { data } = await api.get("/super-admin/events", { params });
    return data;
};

export const getSuperAdminEventByIdApi = async (id) => {
    const { data } = await api.get(`/super-admin/events/${id}`);
    return data;
};

// body: { isVerified: true|false, rejectionReason?: string }
export const verifySuperAdminEventApi = async (id, payload) => {
    const { data } = await api.patch(`/super-admin/events/${id}/verify`, payload);
    return data;
};
