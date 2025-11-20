import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { type KcContext } from "../KcContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSidebar } from "./AccountSidebar";

interface PageHeaderProps {
    kcContext: KcContext;
}

export function PageHeader({ kcContext }: PageHeaderProps) {
    return (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4 pointer-events-none">
            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl pt-1 pointer-events-auto">
                <div className="flex items-center justify-between min-h-12 gap-4 pb-1 px-2 md:px-3">
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center flex-1 min-w-0 overflow-hidden">
                        <AccountSidebar 
                            kcContext={kcContext} 
                            currentPageId={kcContext.pageId}
                        />
                    </div>

                    {/* Mobile Hamburger Menu */}
                    <div className="md:hidden flex-1">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0">
                                <div className="relative h-full pt-12 pb-6 px-4">
                                    <AccountSidebar 
                                        kcContext={kcContext} 
                                        currentPageId={kcContext.pageId}
                                        onItemClick={() => {
                                            // Sheet will close automatically on navigation
                                        }}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-1">
                        <ThemeSwitcher />
                        <LanguageSwitcher kcContext={kcContext} />
                    </div>
                </div>
            </div>
        </header>
    );
}

