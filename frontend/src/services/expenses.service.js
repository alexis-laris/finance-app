import api from "../lib/axios";


export const getExpensesRequest = async () => {
    const res = await api.get("/expenses");
    return res.data;
};


export const createExpenseRequest = async (expense) => {
    const res = await api.post("/expenses", expense);
    return res.data;
};


export const updateExpenseRequest = async (id, expense) => {
    const res = await api.put(`/expenses/${id}`, expense);
    return res.data;
};


export const deleteExpenseRequest = async (id) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
};