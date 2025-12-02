import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { SocialLinks } from "@/components/SocialLinks";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Larry | Engineering Portfolio",
  description: "A dual-domain engineering portfolio bridging Civil and Tech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-deep-charcoal text-soft-white selection:bg-electric-cyan selection:text-deep-charcoal`}
      >
        <ModeSwitcher />
        <SocialLinks />
        {children}
      </body>
    </html>
  );
}
