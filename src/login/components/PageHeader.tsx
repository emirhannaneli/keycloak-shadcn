import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { type KcContext } from "../KcContext";

interface PageHeaderProps {
    kcContext: KcContext;
}

export function PageHeader({ kcContext }: PageHeaderProps) {
    return (
        <div 
            className="flex items-center justify-center gap-1 rounded-t-2xl border border-b-0 bg-background/95 px-2 py-1.5 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80 pointer-events-auto fixed bottom-0 left-1/2 z-50 -translate-x-1/2 w-fit max-w-[100vw]"
            style={{ willChange: 'transform' }}
        >
            <ThemeSwitcher />
            <LanguageSwitcher kcContext={kcContext} />
        </div>
    );
}

