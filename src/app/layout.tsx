import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

/* 🧠 Font Imports */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

<body
  className="
    bg-black text-white antialiased
    flex flex-col items-center
  "
></body>

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "K-1000",
  description: "KIIT's Elite Engineering Guild",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${orbitron.variable}
          antialiased bg-black text-white
        `}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
