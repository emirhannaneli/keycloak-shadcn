import { type KcContext } from "../KcContext";
import { PageHeader } from "./PageHeader";

interface PageWrapperProps {
    kcContext: KcContext;
    children: React.ReactNode;
}

export function PageWrapper({ kcContext, children }: PageWrapperProps) {
    return (
        <>
            <div className="pb-20">{children}</div>
            <PageHeader kcContext={kcContext} />
        </>
    );
}

