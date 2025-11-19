import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type KcContext } from "../KcContext";

interface KcCheckboxProps {
    kcContext?: KcContext;
    name: string;
    id?: string;
    label?: string;
    defaultChecked?: boolean;
    disabled?: boolean;
    required?: boolean;
    tabIndex?: number;
    className?: string;
    labelClassName?: string;
}

export function KcCheckbox({
    name,
    id,
    label,
    defaultChecked,
    disabled,
    required,
    tabIndex,
    className,
    labelClassName,
}: KcCheckboxProps) {
    const checkboxId = id || name;

    return (
        <div className="flex items-center space-x-2">
            <Checkbox
                id={checkboxId}
                name={name}
                defaultChecked={defaultChecked}
                disabled={disabled}
                required={required}
                tabIndex={tabIndex}
                className={className}
            />
            {label && (
                <Label
                    htmlFor={checkboxId}
                    className={labelClassName}
                >
                    {label}
                </Label>
            )}
        </div>
    );
}

