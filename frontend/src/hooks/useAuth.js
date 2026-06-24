import { useQuery } from "@tanstack/react-query";
import { meRequest } from "../services/auth.service";

export const useAuth = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: meRequest,
        retry: false
    });
};