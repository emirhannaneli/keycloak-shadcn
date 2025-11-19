import { type KcContext } from "../KcContext";
import { AccountSidebar } from "./AccountSidebar";

interface AccountLayoutProps {
    kcContext: KcContext;
    children: React.ReactNode;
}

export function AccountLayout({ kcContext, children }: AccountLayoutProps) {
    return (
        <div className="min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2 w-64 rounded-2xl border bg-card shadow-lg p-4 z-10 flex items-center">
                <AccountSidebar kcContext={kcContext} currentPageId={kcContext.pageId} />
            </aside>

            <main className="px-4 md:px-2 py-6 min-h-screen flex items-center justify-center w-full">
                <div className="w-full max-w-2xl">
                    {children}
                </div>
            </main>
        </div>
    );
}

