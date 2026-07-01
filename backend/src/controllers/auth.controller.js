import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabase.js";


import { prisma } from "../lib/prisma.js";


const isProduction = process.env.NODE_ENV === "production";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        const usersCount = await prisma.user.count();

        const hashed = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role: "USER"
            },
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(400).json({ message: "User not found" });

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) return res.status(400).json({ message: "Wrong password" });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const me = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
        });

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const logout = async (req, res) => {
    return res.json({ message: "Logged out" });
};


export const updateProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const { name, email } = req.body;
        let avatarUrl = user.avatarUrl;

        // Si vino un archivo (multer lo pone en req.file)
        if (req.file) {
            const fileExt = req.file.originalname.split(".").pop();
            const fileName = `${user.id}-${uuidv4()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true,
                });

            if (uploadError) {
                console.error(uploadError);
                return res.status(500).json({ message: "Error al subir imagen" });
            }

            // Si ya tenía avatar anterior, lo borramos para no acumular basura
            if (user.avatarUrl) {
                const oldFileName = user.avatarUrl.split("/").pop();
                await supabase.storage.from("avatars").remove([oldFileName]);
            }

            const { data: publicUrlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(fileName);

            avatarUrl = publicUrlData.publicUrl;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: name ?? user.name,
                email: email ?? user.email,
                avatarUrl,
            },
        });

        return res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatarUrl: updatedUser.avatarUrl,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};