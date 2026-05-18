import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LokaalHint from "@/components/LokaalHint";
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
  title: "Budgetbeheer",
  description: "Budgetbeheer per afdeling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LokaalHint />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
