import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-ignore: allow side-effect import of global CSS without module declarations
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ilack Voice App",
  description: "Ilack Voice App",
  keywords: [
    "Ilack Voice",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "Ilack",
    "KMAssociations",
  ],
  authors: [{ name: "KMAssociations Team" }],
  openGraph: {
    title: "Ilack Voice App",
    description: "Ilack Voice app",
    url: "https://ilack-voice.netlify.app/",
    siteName: "Ilack Voice",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ilack Voice App",
    description: "Ilack Voice app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
