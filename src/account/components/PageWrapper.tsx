import { type KcContext } from "../KcContext";
import { PageHeader } from "./PageHeader";
import { AccountLayout } from "./AccountLayout";

interface PageWrapperProps {
    kcContext: KcContext;
    children: React.ReactNode;
}

export function PageWrapper({ kcContext, children }: PageWrapperProps) {
    return (
        <AccountLayout kcContext={kcContext}>
            <div className="pb-20">{children}</div>
            <PageHeader kcContext={kcContext} />
        </AccountLayout>
    );
}

