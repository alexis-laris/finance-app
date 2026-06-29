import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
    getCategoriesRequest,
    createCategoryRequest,
    updateCategoryRequest,
    deleteCategoryRequest,
} from "../services/categories.service";

import CategoryForm, { resolveCategoryIcon } from "../components/CategoryForm";
import Loader from "../components/utils/Loader";

export default function Categories() {
    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategoriesRequest,
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["categories"] });

    const createMutation = useMutation({
        mutationFn: createCategoryRequest,
        onSuccess: () => {
            invalidate();
            setOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateCategoryRequest,
        onSuccess: () => {
            invalidate();
            setOpen(false);
            setEditingCategory(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategoryRequest,
        onSuccess: () => {
            invalidate();
            setDeletingCategory(null);
        },
    });

    const isSubmitting =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending;


    const openCreateModal = () => {
        setEditingCategory(null);
        setOpen(true);
    };

    const openEditModal = (cat) => {
        setEditingCategory(cat);
        setOpen(true);
    };

    const handleSubmit = (data) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleCloseModal = () => {
        setOpen(false);
        setEditingCategory(null);
    };

    const handleConfirmDelete = () => {
        if (deletingCategory) {
            deleteMutation.mutate(deletingCategory.id);
        }
    };

    const goToCategoryDetail = (cat) => {
        navigate(`/dashboard/categories/${cat.id}`);
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <>
            {isSubmitting && <Loader />}
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Categorías</h1>
                        <p className="text-sm text-gray-400">
                            Administra tus categorías de gastos
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="
                        flex items-center gap-2
                        rounded-full px-5 py-5 text-sm
                        bg-[#0f1115]
                        text-[#07D896]
                        border border-[#07D896]/40
                        transition
                        hover:border-[#07D896]
                        cursor-pointer
                    "
                    >
                        <Plus size={18} />
                        Nueva categoría
                    </Button>
                </div>

                <div className="
                grid gap-4
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
            ">
                    {categories.map((cat) => {
                        const Icon = resolveCategoryIcon(cat.icon);

                        return (
                            <div
                                key={cat.id}
                                className="
                                    group relative overflow-hidden
                                    rounded-2xl border border-white/10
                                    bg-linear-to-br from-[#0B0F27] to-[#0f1115]
                                    p-5
                                    transition-all duration-300
                                    hover:scale-[1.02] hover:border-white/20
                                "
                            >

                                <div
                                    className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                                    style={{
                                        backgroundColor: cat?.color || "#07D896",
                                    }}
                                />


                                <div className="absolute right-3 top-3 flex gap-1 transition-opacity opacity-100 z-10">
                                    <Button
                                        onClick={() => openEditModal(cat)}
                                        className="rounded-md bg-black/40 p-1.5 h-auto w-auto text-white hover:border-[#07D896] cursor-pointer"
                                    >
                                        <Pencil size={14} />
                                    </Button>

                                    <Button
                                        onClick={() => setDeletingCategory(cat)}
                                        className="rounded-md bg-black/40 p-1.5 h-auto w-auto text-gray-300 hover:border-red-500 hover:text-white cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>


                                <div className="flex justify-center mb-4">
                                    <div
                                        className="
                                        flex h-16 w-16 items-center justify-center
                                        rounded-2xl
                                    "
                                        style={{
                                            backgroundColor: `${cat.color}20`,
                                            color: cat.color,
                                        }}
                                    >
                                        <Icon size={28} strokeWidth={1.8} />
                                    </div>
                                </div>


                                <h2 className="text-2xl font-bold tracking-tight text-white text-center">
                                    {cat.name}
                                </h2>


                                <p className="text-sm text-gray-400 mt-3 leading-relaxed text-center">
                                    {cat.description}
                                </p>




                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">

                                    <p className="text-xs text-gray-500">
                                        Creada:{" "}
                                        <span className="text-white font-bold">
                                            {cat.createdAtFormatted}
                                        </span>
                                    </p>

                                    <Button
                                        onClick={() => goToCategoryDetail(cat)}
                                        className="
            self-end sm:self-auto
            inline-flex items-center gap-1.5
            rounded-full px-4 py-2 text-xs font-medium
            bg-[#0f1115]
            border
            transition-all duration-200
            hover:brightness-125
            cursor-pointer
        "
                                        style={{
                                            color: cat.color,
                                            borderColor: `${cat.color}66`,
                                        }}
                                    >
                                        Ver categoría
                                        <ArrowUpRight size={14} />
                                    </Button>

                                </div>


                                <div
                                    className="absolute bottom-0 left-0 h-1 w-full"
                                    style={{ backgroundColor: cat.color }}
                                />
                            </div>
                        );
                    })}
                </div>

                <Dialog open={open} onOpenChange={(v) => !v && handleCloseModal()}>
                    <DialogContent
                        className="
        w-[95vw]
        sm:max-w-lg
        lg:max-w-xl
        max-h-[90vh]
        overflow-y-auto
        p-0
        scrollbar-thin
        scrollbar-track-transparent
        scrollbar-thumb-white/20
        hover:scrollbar-thumb-white/40
    "
                    >
                        <CategoryForm
                            category={editingCategory}
                            onSubmit={handleSubmit}
                            onClose={handleCloseModal}
                        />
                    </DialogContent>
                </Dialog>

                <AlertDialog
                    open={Boolean(deletingCategory)}
                    onOpenChange={(v) => !v && setDeletingCategory(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                ¿Eliminar "{deletingCategory?.name}"?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. La categoría se eliminará permanentemente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer rounded-full border border-white/10 bg-transparent py-3 text-sm text-[#A9ACB7] hover:bg-white/5 hover:text-white">
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmDelete}
                                className="cursor-pointer bg-red-600 hover:bg-red-800 rounded-full"
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

        </>
    );
}