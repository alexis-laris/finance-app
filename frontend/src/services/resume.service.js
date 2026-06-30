import api from "../api/axios";

export const getDashboardResumeRequest = async () => {
    const res = await api.get("/resume");
    return res.data;
};

export const getNotificationsRequest = async () => {
    const res = await api.get("/resume/notifications");
    return res.data;
};

export const markNotificationsSeenRequest = async () => {
    const res = await api.post("/resume/notifications/seen");
    return res.data;
};