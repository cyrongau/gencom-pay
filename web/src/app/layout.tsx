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
  title: "Gencom Pay - Unified Exchange Dashboard",
  description: "High-integrity escrow and wallet system powered by Generex Communications.",
  openGraph: {
    title: "Gencom Pay - Unified Exchange Dashboard",
    description: "High-integrity escrow and wallet system powered by Generex Communications.",
    url: "https://pay.generexcom.com",
    siteName: "Gencom Pay",
    images: [
      {
        url: "https://pay.generexcom.com/assets/dashboard.png",
        width: 1200,
        height: 630,
        alt: "Gencom Pay Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gencom Pay - Unified Exchange Dashboard",
    description: "High-integrity escrow and wallet system powered by Generex Communications.",
    images: ["https://pay.generexcom.com/assets/dashboard.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0B1225]">
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
