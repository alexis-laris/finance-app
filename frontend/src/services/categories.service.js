import api from "../api/axios";

export const getCategoriesRequest = async () => {
    const res = await api.get("/categories");
    return res.data;
};


export const createCategoryRequest = async (category) => {
    const res = await api.post("/categories", category);
    return res.data;
};


export const updateCategoryRequest = async ({ id, data }) => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
};


export const deleteCategoryRequest = async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
};