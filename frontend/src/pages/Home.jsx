import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0B0F27] text-white font-Montserrat">


            <section className="flex flex-col items-center text-center px-10 py-24">
                <h1 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight mb-4">
                    Tus finanzas,{" "}
                    <span className="text-[#07D896]">en orden</span>
                </h1>

                <p className="text-[#A9ACB7] text-sm md:text-base leading-relaxed mb-8">
                    Registra gastos, define metas y lleva el control
                    <br />
                    de tu dinero cada mes.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/register")}
                        className="px-4 py-2 text-sm bg-[#07D896] text-gray-900 rounded-full hover:opacity-90 transition cursor-pointer"
                    >
                        Empezar
                    </button>

                    <button
                        onClick={() => navigate("/login")}
                        className="px-4 py-2 text-sm text-[#FFFF] border border-gray-400 rounded-full hover:bg-gray-800 transition cursor-pointer"
                    >
                        Iniciar sesión
                    </button>
                </div>
            </section>

        </div>
    );
}