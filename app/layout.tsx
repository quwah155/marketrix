import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "quwahmarket-saas - Premium Digital Products",
    template: "%s | quwahmarket-saas",
  },
  description:
    "Discover and purchase premium digital products from verified vendors. Templates, courses, software, and more.",
  keywords: ["digital marketplace", "templates", "courses", "software", "saas"],
  authors: [{ name: "quwahmarket-saas" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "quwahmarket-saas - Premium Digital Products",
    description: "Discover and purchase premium digital products from verified vendors.",
    siteName: "quwahmarket-saas",
  },
  twitter: {
    card: "summary_large_image",
    title: "quwahmarket-saas",
    description: "Premium digital products marketplace",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Inline script: stamps dark/light class before React hydrates to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';var r=document.documentElement;if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}r.classList.add(t);}catch(e){}})();`,
          }}
        />
      </head>
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

