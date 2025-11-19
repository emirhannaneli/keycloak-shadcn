import { Input, type InputProps } from "@/components/ui/input";
import { type KcContext } from "../KcContext";

interface KcInputProps extends InputProps {
    kcContext?: KcContext;
    name?: string;
    id?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    defaultValue?: string;
    disabled?: boolean;
    required?: boolean;
    tabIndex?: number;
    type?: string;
}

export function KcInput({
    kcContext,
    name,
    id,
    autoComplete,
    autoFocus,
    defaultValue,
    disabled,
    required,
    tabIndex,
    type = "text",
    className,
    ...props
}: KcInputProps) {
    return (
        <Input
            id={id || name}
            name={name}
            type={type}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            defaultValue={defaultValue}
            disabled={disabled}
            required={required}
            tabIndex={tabIndex}
            className={className}
            {...props}
        />
    );
}

