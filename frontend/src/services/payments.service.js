import api from "../api/axios";

export const getPaymentsRequest = async () => {
    const res = await api.get("/payment");
    return res.data;
};

export const getPaymentByIdRequest = async (id) => {
    const res = await api.get(`/payment/${id}`);
    return res.data;
};

export const createPaymentRequest = async (payment) => {
    const res = await api.post("/payment", payment);
    return res.data;
};

export const updatePaymentRequest = async (id, payment) => {
    const res = await api.put(`/payment/${id}`, payment);
    return res.data;
};

export const deletePaymentRequest = async (id) => {
    const res = await api.delete(`/payment/${id}`);
    return res.data;
};

export const togglePaymentStatusRequest = async (id) => {
    const res = await api.patch(`/payment/${id}/toggle`);
    return res.data;
};