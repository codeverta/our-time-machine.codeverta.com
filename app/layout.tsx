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
  title: "Our Time Machine — Majapahit 1350 M",
  description: "Petualangan edukasi 3D untuk menjelajahi Trowulan, berbicara dengan tokoh, mengumpulkan artefak, dan menulis Time Travel Diary.",
  openGraph: {
    title: "Our Time Machine — Majapahit 1350 M",
    description: "Jelajahi kehidupan Majapahit dalam petualangan edukasi 3D.",
    type: "website",
    images: [{ url: "/og.png", width: 1672, height: 941, alt: "Our Time Machine — Majapahit 1350 M" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Time Machine — Majapahit 1350 M",
    description: "Jelajahi kehidupan Majapahit dalam petualangan edukasi 3D.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
