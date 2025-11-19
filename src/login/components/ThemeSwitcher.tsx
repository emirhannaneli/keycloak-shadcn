import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function ThemeSwitcher() {
    const [theme, setTheme] = useState<Theme>("system");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored) {
            setTheme(stored);
        } else {
            // Sistem temasını kontrol et
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setTheme("system");
            updateTheme("system", prefersDark);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === "system") {
                updateTheme("system", e.matches);
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme, mounted]);

    const updateTheme = (newTheme: Theme, isDark?: boolean) => {
        const root = document.documentElement;
        
        if (newTheme === "system") {
            const prefersDark = isDark ?? window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (prefersDark) {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        } else if (newTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        updateTheme(newTheme);
    };

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    {theme === "light" ? (
                        <Sun className="h-4 w-4" />
                    ) : theme === "dark" ? (
                        <Moon className="h-4 w-4" />
                    ) : (
                        <Monitor className="h-4 w-4" />
                    )}
                    <span className="sr-only">Tema değiştir</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center">
                <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Aydınlık</span>
                    {theme === "light" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Koyu</span>
                    {theme === "dark" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>Sistem</span>
                    {theme === "system" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

