import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ApplicationShell } from "@/components/application-shell/ApplicationShell";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Fitness Solution",
    template: "%s | AI Fitness Solution",
  },
  description: "AI-powered enterprise fitness planning platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApplicationShell>{children}</ApplicationShell>
      </body>
    </html>
  );
}

