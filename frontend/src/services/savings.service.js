import api from "../api/axios";

export const createSavingGoalRequest = async (data) => {
    const res = await api.post("/savings", data);
    return res.data;
};

export const getSavingGoalsRequest = async () => {
    const res = await api.get("/savings");
    return res.data;
};

export const getSavingGoalByIdRequest = async (id) => {
    const res = await api.get(`/savings/${id}`);
    return res.data;
};

export const addSavingContributionRequest = async (id, data) => {
    const res = await api.post(`/savings/${id}/contributions`, data);
    return res.data;
};

export const updateSavingGoalRequest = async ({ id, data }) => {
    const res = await api.put(`/savings/${id}`, data);
    return res.data;
};

export const deleteSavingGoalRequest = async (id) => {
    const res = await api.delete(`/savings/${id}`);
    return res.data;
};

export const updateContributionRequest = async ({ id, contributionId, data }) => {
    const res = await api.put(`/savings/${id}/contributions/${contributionId}`, data);
    return res.data;
};

export const deleteContributionRequest = async ({ id, contributionId }) => {
    const res = await api.delete(`/savings/${id}/contributions/${contributionId}`);
    return res.data;
};

