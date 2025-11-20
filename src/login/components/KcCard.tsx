import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    type CardProps,
} from "@/components/ui/card";
import { type KcContext } from "../KcContext";
import { cn } from "@/lib/utils";

interface KcCardProps extends CardProps {
    kcContext?: KcContext;
    title?: string;
    description?: string;
    children?: React.ReactNode;
}

export function KcCard({
    kcContext,
    title,
    description,
    children,
    className,
    ...props
}: KcCardProps) {
    const realm = kcContext?.realm;
    const realmName = realm?.displayName || realm?.name;

    // Title'ın HTML içerik olup olmadığını kontrol et
    const isHtmlTitle = typeof title === 'string' && (title.includes('<') || title.includes('&'));

    return (
        <Card className={cn("shadow-lg", className)} {...props}>
            {(title || description || realmName) && (
                <CardHeader className="space-y-0.5 pb-2">
                    {title && (
                        <CardTitle 
                            className="text-xl"
                            {...(isHtmlTitle ? { dangerouslySetInnerHTML: { __html: title } } : { children: title })}
                        />
                    )}
                    {description && <CardDescription className="text-sm">{description}</CardDescription>}
                    {realmName && (
                        <CardDescription className="text-xs text-muted-foreground mt-1">
                            {realmName}
                        </CardDescription>
                    )}
                </CardHeader>
            )}
            <CardContent className="space-y-2">{children}</CardContent>
        </Card>
    );
}

export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

