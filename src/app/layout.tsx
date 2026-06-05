import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Literata } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { isAuthEnabled } from "@/lib/auth";
import { THEME_NAMES } from "@/lib/themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const literata = Literata({ subsets: ["latin"], variable: "--font-literata", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "goread — read the classics, free",
    template: "%s · goread",
  },
  description:
    "A calm, beautiful reader for 70,000+ free public-domain books from Project Gutenberg. Bookmarks, reading themes, streaks, and your library — on every device.",
  applicationName: "goread",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "goread" },
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  formatDetection: { telephone: false },
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
        </ThemeProvider>
      </body>
    </html>
  );

  return authEnabled ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
