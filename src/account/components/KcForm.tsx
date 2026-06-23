import { type KcContext } from "../KcContext";
import { type FormEventHandler, type ReactNode } from "react";

interface KcFormProps {
    kcContext?: KcContext;
    action?: string;
    method?: "get" | "post";
    children: ReactNode;
    className?: string;
    id?: string;
    onSubmit?: FormEventHandler<HTMLFormElement>;
}

export function KcForm({
    action,
    method = "post",
    children,
    className,
    id,
    onSubmit,
}: KcFormProps) {
    return (
        <form action={action} method={method} id={id} className={className} onSubmit={onSubmit}>
            {children}
        </form>
    );
}

