import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";

const titleFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-title"
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Anonymous Chat Blueprint",
  description: "KISS anonymous random chat with Redis + worker architecture"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${titleFont.variable} ${monoFont.variable}`}
    >
      <body suppressHydrationWarning className="font-title antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
