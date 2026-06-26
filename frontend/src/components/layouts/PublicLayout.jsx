import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-[#0B0F27] text-white font-Montserrat">
            <Navbar />
            <Outlet />
        </div>
    );
}