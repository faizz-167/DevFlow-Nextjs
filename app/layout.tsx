import type { Metadata } from "next";
import { Inter, Space_Grotesk as SpaceGrotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const spaceGrotesk = SpaceGrotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "DevInsight",
    description:
        "DevInsight is a platform for developers to share and discover code snippets, tutorials, and resources.",
    referrer: "origin-when-cross-origin",
    keywords: [
        "JavaScript",
        "React",
        "Next.js",
        "web development",
        "Dev Overflow",
    ],
    authors: { name: "Adrian" },
    icons: {
        icon: "/images/site-logo.svg",
    },
    creator: "Mohamed Faiz",
    publisher: "Dev Insight",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
};

const RootLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await auth();
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <link
                    rel="stylesheet"
                    type="text/css"
                    href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
                />
            </head>
            <SessionProvider session={session}>
                <body
                    className={`${inter.className} ${spaceGrotesk.variable} antialiased`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        disableTransitionOnChange
                        enableSystem
                    >
                        <NuqsAdapter>{children}</NuqsAdapter>
                        <Toaster position="top-center" richColors />
                    </ThemeProvider>
                </body>
            </SessionProvider>
        </html>
    );
};

export default RootLayout;
