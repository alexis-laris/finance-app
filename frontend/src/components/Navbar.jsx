import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setMenuOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    return (
        <>
            <nav
                className={`
                    fixed top-0 left-0 right-0 z-50
                    transition-all duration-300 overflow-hidden
                    ${scrolled ? "bg-[#0B0F27]/95 backdrop-blur-xl" : "bg-transparent"}
                `}
            >

                <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-64 h-20 rounded-full bg-[#07D896]/15 blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between px-10 py-5 relative z-10">

                    <div
                        className="text-[#07D896] font-bold text-xl cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        Finance App
                    </div>


                    <div className="hidden md:flex gap-3">
                        <button
                            onClick={() => navigate("/login")}
                            className="px-4 py-2 text-sm text-white border border-gray-400 rounded-full hover:bg-gray-800 transition cursor-pointer"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="px-4 py-2 text-sm bg-[#07D896] text-gray-900 rounded-full hover:opacity-90 transition cursor-pointer"
                        >
                            Crear cuenta
                        </button>
                    </div>


                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="hidden max-md:flex flex-col justify-between w-7 h-5 z-60 relative"
                        aria-label="Toggle menu"
                    >
                        <span className={`block h-0.5 bg-[#07D896] rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2.25" : ""}`} />
                        <span className={`block h-0.5 bg-[#07D896] rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                        <span className={`block h-0.5 bg-[#07D896] rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2.25" : ""}`} />
                    </button>
                </div>


                <div className="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-[#07D896]/60 via-[#07D896]/20 to-transparent" />
            </nav>


            <div className="h-18.25" />


            <div
                className={`
                    fixed inset-0 z-40 bg-[#0B0F27]
                    flex flex-col justify-center px-10
                    transition-all duration-500 ease-in-out
                    ${menuOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-full pointer-events-none"}
                `}
            >

                <h1 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight mb-4">
                    Tus finanzas,{" "}
                    <span className="text-[#07D896]">en orden</span>
                </h1>

                <p className="text-[#A9ACB7] text-sm md:text-base leading-relaxed mb-8">
                    Registra gastos, define metas y lleva el control
                    <br />
                    de tu dinero cada mes.
                </p>
                <div className="flex flex-col gap-4 items-start">
                    <button
                        onClick={() => { navigate("/login"); setMenuOpen(false); }}
                        className="w-full px-4 py-2 text-sm text-white border border-gray-400 rounded-full hover:bg-gray-800 transition cursor-pointer"
                    >
                        Iniciar sesión
                    </button>
                    <button
                        onClick={() => { navigate("/register"); setMenuOpen(false); }}
                        className="w-full px-4 py-2 text-sm bg-[#07D896] text-gray-900 rounded-full hover:opacity-90 transition cursor-pointer"
                    >
                        Crear cuenta
                    </button>
                </div>


            </div>
        </>
    );
}