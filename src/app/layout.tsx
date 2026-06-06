import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Literata } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SyncManager } from "@/components/sync-manager";
import { isAuthEnabled } from "@/lib/auth";
import { THEME_NAMES } from "@/lib/themes";
import { SiteJsonLd } from "@/components/json-ld";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const literata = Literata({ subsets: ["latin"], variable: "--font-literata", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · goread",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "free ebooks",
    "Project Gutenberg",
    "public domain books",
    "read classics online",
    "online ebook reader",
    "free books",
    "classic literature",
    "EPUB reader",
  ],
  authors: [{ name: SITE_NAME }],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: SITE_NAME },
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  formatDetection: { telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1714" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const authEnabled = isAuthEnabled();

  const tree = (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${cormorant.variable} ${literata.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-bg text-fg">
        <SiteJsonLd />
        <ThemeProvider
          attribute="data-theme"
          themes={[...THEME_NAMES]}
          defaultTheme="system"
          enableSystem
          enableColorScheme
          disableTransitionOnChange
        >
          <SiteHeader authEnabled={authEnabled} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <ServiceWorkerRegister />
          {authEnabled ? <SyncManager /> : null}
        </ThemeProvider>
      </body>
    </html>
  );

  return authEnabled ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
