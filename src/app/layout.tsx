import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SmoothScroll from "@/components/ui/Smoothscroll"; // Adjust path if needed
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
  metadataBase: new URL("https://k1000.kiit.ac.in"),
  title: "K-1000 | Official R&D Society of KIIT",
  description:
    "K-1000 is the official R&D society of KIIT, fostering research, innovation, technical growth, and high-impact student engineering culture.",
  openGraph: {
    title: "K-1000 | Official R&D Society of KIIT",
    description:
      "K-1000 is the official R&D society of KIIT, fostering research, innovation, technical growth, and high-impact student engineering culture.",
    url: "https://k1000.kiit.ac.in",
    siteName: "K-1000",
    images: [
      {
        url: "/og-preview.jpeg",
        width: 1200,
        height: 630,
        alt: "K-1000 Open Graph Preview",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "K-1000 | Official R&D Society of KIIT",
    description:
      "K-1000 is the official R&D society of KIIT, fostering research, innovation, technical growth, and high-impact student engineering culture.",
    images: ["/og-preview.jpeg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${orbitron.variable}
          antialiased bg-black text-white
        `}
      >
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <Analytics />
      </body>
    </html>
  );
}
