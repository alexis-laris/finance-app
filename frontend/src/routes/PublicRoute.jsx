import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/utils/Loader";

export default function PublicRoute({ children }) {
    const { data, isLoading } = useAuth();

    if (isLoading) return <Loader />;

    if (data) return <Navigate to="/dashboard" />;

    return children;
}