import { type KcContext } from "../KcContext";
import { type ReactNode } from "react";

interface KcFormProps {
    kcContext?: KcContext;
    action?: string;
    method?: "get" | "post";
    children: ReactNode;
    className?: string;
    id?: string;
}

export function KcForm({
    action,
    method = "post",
    children,
    className,
    id,
}: KcFormProps) {
    return (
        <form action={action} method={method} id={id} className={className}>
            {children}
        </form>
    );
}

