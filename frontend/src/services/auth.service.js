import api from "../api/axios";

export const registerRequest = async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
};

export const loginRequest = async (data) => {
    const res = await api.post("/auth/login", data);
    localStorage.setItem("token", res.data.token);
    return res.data;
};

export const meRequest = async () => {
    const res = await api.get("/auth/me");
    return res.data;
};

export const logoutRequest = async () => {
    localStorage.removeItem("token");
    return { message: "Logged out" };
};

export const updateProfileRequest = async (formData) => {
    const res = await api.put("/auth/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};