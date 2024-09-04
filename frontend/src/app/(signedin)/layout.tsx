import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

import { Toaster } from "@/components/ui/toaster"
import Sidebar from "@/components/shared/Sidebar"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Home",
    description: "Home Page",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${inter.className} flex h-screen bg-gray-100`}>
            <div className="w-64 bg-white shadow-md">
                <Sidebar/>
            </div>
            <div className="flex-1 overflow-auto p-8">
                {children}
            </div>
            <Toaster/>
        </body>
        </html>
    );
}
