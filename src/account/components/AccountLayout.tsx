import { type KcContext } from "../KcContext";
import { AccountSidebar } from "./AccountSidebar";

interface AccountLayoutProps {
    kcContext: KcContext;
    children: React.ReactNode;
}

export function AccountLayout({ kcContext, children }: AccountLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 px-4 md:px-6 py-6 flex items-center justify-center w-full pt-24">
                <div className="w-full max-w-4xl">
                    {children}
                </div>
            </main>
        </div>
    );
}

