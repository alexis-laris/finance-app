import api from "../api/axios";

export const getDashboardResumeRequest = async () => {
    const res = await api.get("/resume");
    return res.data;
};