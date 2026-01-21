import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "video.js/dist/video-js.css";
import Header from "./components/Header";
import { Providers } from "./providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Birdcam",
    description: "Live Birdbox Camera Application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-neutral-950 text-neutral-200 selection:bg-emerald-500/30`}
            >
                <Providers>
                    <Header />
                    <main className="max-w-7xl mx-auto px-4 py-8">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
