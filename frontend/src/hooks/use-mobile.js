import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 1024;

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
    );

    useEffect(() => {
        if (typeof window === "undefined") return;
        const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        window.addEventListener("resize", checkMobile);
        checkMobile();
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return isMobile;
}