import { type KcContext } from "../KcContext";

interface AccountLayoutProps {
    kcContext: KcContext;
    children: React.ReactNode;
}

export function AccountLayout({ children }: AccountLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 px-4 md:px-6 py-6 flex items-center justify-center w-full pt-36 md:pt-32">
                <div className="w-full max-w-4xl">
                    {children}
                </div>
            </main>
        </div>
    );
}

