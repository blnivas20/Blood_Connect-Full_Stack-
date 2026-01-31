import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/context/auth-context";
import { ChatWindow } from "@/components/chat-window";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blood Connect - Save Lives, Donate Blood",
  description:
    "Connect with blood donors in your area. Join the Blood Connect community and help save lives through blood donation.",
  keywords: ["blood donation", "blood donors", "healthcare", "save lives"],
    generator: 'v0.app'
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <ChatWindow />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
