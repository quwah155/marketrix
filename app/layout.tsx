import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Marketrix - Premium Digital Products Marketplace",
    template: "%s | Marketrix",
  },
  description:
    "Discover and purchase premium digital products from verified vendors. Templates, courses, software, and more.",
  keywords: ["digital marketplace", "templates", "courses", "software", "saas", "marketrix"],
  authors: [{ name: "Marketrix" }],
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Marketrix - Premium Digital Products Marketplace",
    description: "Discover and purchase premium digital products from verified vendors.",
    siteName: "Marketrix",
    images: [{ url: "/favicon.png", width: 512, height: 512, alt: "Marketrix" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketrix",
    description: "Premium digital products marketplace",
    images: ["/favicon.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: "500",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
