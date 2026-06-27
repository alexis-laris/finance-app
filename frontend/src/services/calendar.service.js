import api from "../api/axios";

export const getCalendarRequest = async (month) => {
    const res = await api.get("/calendar", { params: { month } });
    return res.data;
};

export const getCalendarDayRequest = async (date) => {
    const res = await api.get("/calendar/day", { params: { date } });
    return res.data;
};