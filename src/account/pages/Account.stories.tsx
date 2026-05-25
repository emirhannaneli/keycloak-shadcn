import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "account.ftl" });

const meta = {
    title: "account/account.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory />
};

/**
 * UsernameNotEditable:
 * - Purpose: Test the scenario where the username field is not editable.
 * - Scenario: The component renders, but the username field is disabled.
 * - Key Aspect: Ensures that the `editUsernameAllowed` condition is respected and the username field is read-only.
 */
export const UsernameNotEditable: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                account: {
                    username: "john_doe",
                    email: "john.doe@gmail.com",
                    firstName: "John",
                    lastName: "Doe"
                },
                realm: {
                    registrationEmailAsUsername: false,
                    editUsernameAllowed: false
                },
                referrer: {
                    url: "/home"
                },
                url: {
                    accountUrl: "/account"
                },
                messagesPerField: {
                    printIfExists: () => ""
                },
                stateChecker: "state-checker"
            }}
        />
    )
};

/**
 * WithValidationErrors:
 * - Purpose: Test the form when there are validation errors.
 * - Scenario: The component renders with error messages for invalid input in the fields.
 * - Key Aspect: Ensures that error messages are properly displayed and the user can correct their inputs.
 */
export const WithValidationErrors: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                account: {
                    username: "john_doe",
                    email: "",
                    firstName: "",
                    lastName: "Doe"
                },
                realm: {
                    registrationEmailAsUsername: false,
                    editUsernameAllowed: true
                },
                referrer: {
                    url: "/home"
                },
                url: {
                    accountUrl: "/account"
                },
                messagesPerField: {
                    printIfExists: (field: string) => (field === "email" || field === "firstName" ? "has-error" : ""),
                    existsError: (field: string) => field === "email" || field === "firstName",
                    get: (field: string) => {
                        if (field === "email") return "Email is required.";
                        if (field === "firstName") return "First name is required.";
                        return "";
                    },
                    exists: () => false
                },
                stateChecker: "state-checker"
            }}
        />
    )
};
/**
 * EmailAsUsername:
 * - Purpose: Test the form where email is used as the username.
 * - Scenario: The component renders without a separate username field, and the email field is treated as the username.
 * - Key Aspect: Ensures the form functions correctly when `registrationEmailAsUsername` is enabled.
 */
export const EmailAsUsername: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                account: {
                    email: "john.doe@gmail.com",
                    firstName: "John",
                    lastName: "Doe"
                },
                realm: {
                    registrationEmailAsUsername: true
                },
                referrer: {
                    url: "/home"
                },
                url: {
                    accountUrl: "/account"
                },
                messagesPerField: {
                    printIfExists: () => ""
                },
                stateChecker: "state-checker"
            }}
        />
    )
};

export const WithCustomLogo: Story = {
    render: () => (
        <KcPageStory
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-light:https://placehold.co/200x80/0066cc/white?text=Light+Logo-->" +
                        "<!--logo-dark:https://placehold.co/200x80/00ccff/black?text=Dark+Logo-->",
                },
            } as any}
        />
    ),
};

export const WithFavicon: Story = {
    render: () => (
        <KcPageStory
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--favicon:https://placehold.co/32x32/ff00ff/white.png-->",
                },
            } as any}
        />
    ),
};

export const WithLightLogoOnly: Story = {
    render: () => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-light:https://placehold.co/200x80/0066cc/white?text=Light+Only-->",
                },
            } as any}
        />
    ),
};

export const WithDarkLogoOnly: Story = {
    render: () => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-dark:https://placehold.co/200x80/00ccff/black?text=Dark+Only-->",
                },
            } as any}
        />
    ),
};

export const WithBrokenLogoUrl: Story = {
    render: () => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <KcPageStory
            kcContext={{
                realm: {
                    displayNameHtml:
                        "<!--logo-light:https://example.invalid/missing.png-->",
                },
            } as any}
        />
    ),
};
