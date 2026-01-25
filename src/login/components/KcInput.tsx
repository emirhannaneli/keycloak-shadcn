import { Input, type InputProps } from "@/components/ui/input";
import { type KcContext } from "../KcContext";
import { forwardRef } from "react";

interface KcInputProps extends Omit<InputProps, "name"> {
    kcContext?: KcContext;
    name?: string;
    id?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    defaultValue?: string;
    value?: string;
    disabled?: boolean;
    required?: boolean;
    tabIndex?: number;
    type?: string;
}

export const KcInput = forwardRef<HTMLInputElement, KcInputProps>(({
    kcContext,
    name,
    id,
    autoComplete,
    autoFocus,
    defaultValue,
    value,
    disabled,
    required,
    tabIndex,
    type = "text",
    className,
    ...props
}, ref) => {
    return (
        <Input
            ref={ref}
            id={id || name}
            name={name}
            type={type}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            defaultValue={defaultValue}
            value={value}
            disabled={disabled}
            required={required}
            tabIndex={tabIndex}
            className={className}
            {...props}
        />
    );
});

KcInput.displayName = "KcInput";

