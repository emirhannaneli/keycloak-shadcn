import { Button, type ButtonProps } from "@/components/ui/button";
import { type KcContext } from "../KcContext";

interface KcButtonProps extends Omit<ButtonProps, "type"> {
    kcContext?: KcContext;
    name?: string;
    value?: string;
    type?: "submit" | "button" | "reset";
}

export function KcButton({
    kcContext,
    name,
    value,
    type = "submit",
    className,
    children,
    variant,
    size,
    ...props
}: KcButtonProps) {
    return (
        <Button
            type={type}
            name={name}
            value={value}
            className={className}
            variant={variant}
            size={size}
            {...props}
        >
            {children}
        </Button>
    );
}

