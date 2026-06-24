import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerRequest } from "../services/auth.service";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const mutation = useMutation({
        mutationFn: registerRequest,
        onSuccess: (data) => {
            console.log("Usuario creado:", data);
            navigate("/login");
        },
        onError: (error) => {
            console.log(error.response?.data?.message);
        }
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(form);
    };

    return (
        <div className="min-h-screen bg-[#0B0F27] text-white font-Montserrat">


            <div className="flex items-center justify-center px-10 py-20">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur"
                >
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Crear cuenta
                    </h2>


                    <input
                        type="text"
                        name="name"
                        placeholder="Nombre"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full mb-4 px-4 py-3 rounded-lg bg-[#0B0F27] border border-white/10 focus:outline-none focus:border-[#07D896]"
                    />


                    <input
                        type="email"
                        name="email"
                        placeholder="Correo"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full mb-4 px-4 py-3 rounded-lg bg-[#0B0F27] border border-white/10 focus:outline-none focus:border-[#07D896]"
                    />


                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full mb-6 px-4 py-3 rounded-lg bg-[#0B0F27] border border-white/10 focus:outline-none focus:border-[#07D896]"
                    />


                    {mutation.isError && (
                        <p className="text-red-400 text-sm mb-3 text-center">
                            {mutation.error?.response?.data?.message || "Error al registrar"}
                        </p>
                    )}


                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full py-3 text-sm bg-[#07D896] text-gray-900 rounded-full hover:opacity-90 transition cursor-pointer"
                    >
                        {mutation.isPending ? "Creando cuenta..." : "Crear cuenta"}
                    </button>


                    <p className="text-center text-sm text-[#A9ACB7] mt-5">
                        ¿Ya tienes cuenta?{" "}
                        <span
                            onClick={() => navigate("/login")}
                            className="text-[#07D896] cursor-pointer hover:underline"
                        >
                            Inicia sesión
                        </span>
                    </p>
                </form>
            </div>

        </div>
    );
}