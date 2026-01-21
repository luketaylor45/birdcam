"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const isLive = pathname === "/";
    const isArchive = pathname.startsWith("/view");

    return (
        <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-emerald-400 transition-colors">
                        Birdcam<span className="text-emerald-500">.</span>
                    </Link>

                    <nav className="flex space-x-1">
                        <Link
                            href="/"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${isLive ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                                }`}
                        >
                            <span>Live Stream</span>
                            {/* Live Indicator */}
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        </Link>
                        <Link
                            href="/view"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isArchive ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                                }`}
                        >
                            Archive
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
