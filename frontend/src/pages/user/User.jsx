import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { updateProfileRequest } from "../../services/auth.service";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import Loader from "../../components/utils/Loader";

export default function User() {
    const queryClient = useQueryClient();
    const { data: user } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name ?? "");
            setEmail(user.email ?? "");
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            if (name) formData.append("name", name);
            if (email) formData.append("email", email);
            if (avatarFile) formData.append("avatar", avatarFile);

            await updateProfileRequest(formData);
            await queryClient.invalidateQueries({ queryKey: ["me"] });

            setSuccess(true);
            setAvatarFile(null);
            setPreview(null);
        } catch (err) {
            console.error("Error al actualizar perfil:", err);
            setError(
                err?.response?.data?.message || "Ocurrió un error al actualizar el perfil"
            );
        } finally {
            setLoading(false);
        }
    };

    const currentImage = preview || user?.avatarUrl;

    return (
        <div className="flex justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="font-Montserrat text-white bg-[#0B0F27] p-6 rounded-xl space-y-5 w-full max-w-md"
            >
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">Mi perfil</h1>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <label className="relative cursor-pointer group">
                        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#07D896] text-gray-900 flex items-center justify-center font-bold text-5xl overflow-hidden border-2 border-white/10">
                            {currentImage ? (
                                <img
                                    src={currentImage}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.name?.charAt(0)
                            )}
                        </div>

                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Camera size={22} className="text-white" />
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                    <span className="text-xs text-[#A9ACB7]">
                        Toca la imagen para cambiarla
                    </span>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-[#A9ACB7]">Nombre</label>
                    <input
                        type="text"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none focus:border-[#07D896]"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-[#A9ACB7]">Email</label>
                    <input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none focus:border-[#07D896]"
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-xs text-center">{error}</p>
                )}
                {success && (
                    <p className="text-[#07D896] text-xs text-center">
                        Perfil actualizado correctamente
                    </p>
                )}

                <div className="flex gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 rounded-full bg-[#0f1115] text-[#07D896] border border-[#07D896]/40 hover:border-[#07D896] cursor-pointer disabled:opacity-50"
                    >
                        {loading ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>
            </form>
        </div>
    );
}