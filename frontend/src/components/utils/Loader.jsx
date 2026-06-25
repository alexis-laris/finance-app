import React from 'react'
import { LoaderCircle } from 'lucide-react'

export default function Loader() {
    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
                <LoaderCircle className="h-12 w-12 animate-spin text-orangeCustom" />
                <p className="text-sm font-medium text-white">
                    Cargando...
                </p>
            </div>
        </div>
    )
}