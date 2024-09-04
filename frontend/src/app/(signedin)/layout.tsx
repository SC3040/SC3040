import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster"
import Sidebar from "@/components/shared/Sidebar"
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Home",
    description: "Home Page",
};

export default function SignedInLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar/>
            <div className="flex-1 overflow-auto p-8 lg:p-8 pt-16 lg:pt-8">
                {children}
            </div>
        </div>
    );
}