import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ankor - Autonomous Evidence-Driven Company Builder",
  description: "Virtual company staffed by specialized AI agents that turns real-world evidence into validated products.",
  icons: {
    icon: "/brand/ankor-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-ink bg-canvas min-h-full flex flex-col selection:bg-forest selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
