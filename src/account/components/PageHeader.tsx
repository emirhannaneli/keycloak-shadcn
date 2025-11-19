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
        <div className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 pointer-events-none" style={{ willChange: 'transform' }}>
            <div className="flex items-center gap-1 rounded-t-2xl border border-b-0 bg-background/95 px-3 py-2.5 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80 pointer-events-auto">
                <ThemeSwitcher />
                <LanguageSwitcher kcContext={kcContext} />
                
                {/* Mobile Hamburger Menu - Right side */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
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
        </div>
    );
}

