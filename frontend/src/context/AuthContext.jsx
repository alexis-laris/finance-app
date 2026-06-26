import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { meRequest } from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const token = localStorage.getItem("token");

    const auth = useQuery({
        queryKey: ["me"],
        queryFn: meRequest,
        retry: false,
        enabled: !!token,
    });

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    return useContext(AuthContext);
}