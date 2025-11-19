import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { type KcContext } from "../KcContext";

interface PageHeaderProps {
    kcContext: KcContext;
}

export function PageHeader({ kcContext }: PageHeaderProps) {
    return (
        <div className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 pointer-events-none" style={{ willChange: 'transform' }}>
            <div className="flex items-center gap-1 rounded-t-2xl border border-b-0 bg-background/95 px-3 py-2.5 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80 pointer-events-auto">
                <ThemeSwitcher />
                <LanguageSwitcher kcContext={kcContext} />
            </div>
        </div>
    );
}

