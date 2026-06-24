import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PublicRoute({ children }) {
    const { data, isLoading } = useAuth();

    if (isLoading) return null;


    if (data) {
        return <Navigate to="/dashboard" />;
    }

    return children;
}