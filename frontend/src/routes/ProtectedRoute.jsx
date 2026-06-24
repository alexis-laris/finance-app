import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
    const { data, isLoading, isError } = useAuth();

    if (isLoading) {
        return <p className="text-white">Cargando...</p>;
    }

    if (isError || !data) {
        return <Navigate to="/login" />;
    }

    return children;
}