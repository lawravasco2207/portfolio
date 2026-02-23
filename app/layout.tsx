import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
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
  title: "Larry | Full Stack Engineer & Systems Architect",
  description:
    "Full Stack Engineering // AI Systems // Cloud Infrastructure. I design and deploy scalable digital ecosystems.",
  icons: {
    icon: "/favicon.jpg",
  },
  openGraph: {
    title: "Larry | Full Stack Engineer & Systems Architect",
    description:
      "Full Stack Engineering // AI Systems // Cloud Infrastructure",
    type: "website",
  },
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
        <SocialLinks />
        {children}
      </body>
    </html>
  );
}
