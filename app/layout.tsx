import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SiteChrome from "@/components/layout/SiteChrome";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://primecine.cm";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prime Ciné — Le cinéma camerounais, en streaming",
    template: "%s | Prime Ciné",
  },
  description:
    "Films, séries, documentaires et télé-réalité 100% camerounais. Découvrez Zéro Couple et bien plus sur Prime Ciné.",
  keywords: ["Prime Ciné", "cinéma camerounais", "streaming Cameroun", "Zéro Couple", "films camerounais", "séries africaines"],
  authors: [{ name: "Prime Ciné" }],
  creator: "Prime Ciné",
  applicationName: "Prime Ciné",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Prime Ciné",
    title: "Prime Ciné — Le cinéma camerounais, en streaming",
    description: "Films, séries, documentaires et télé-réalité 100% camerounais.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Prime Ciné" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime Ciné — Le cinéma camerounais, en streaming",
    description: "Films, séries, documentaires et télé-réalité 100% camerounais.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans bg-void text-bone antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-prime focus:px-4 focus:py-2 focus:text-white"
        >
          Aller au contenu principal
        </a>
        <SiteChrome navbar={<Navbar />} footer={<Footer />}>
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
        </SiteChrome>
      </body>
    </html>
  );
}
